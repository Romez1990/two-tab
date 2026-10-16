import { type Browser, browser, hasSiteAccess } from '@/shared/browser';
import { getCheckState, updateCheckState } from './state';

/**
 * Controls the background check from the background script. The check itself runs in the hidden service page
 * `offscreen.html`: the background script cannot parse HTML. Stopping means closing that page.
 */

const OFFSCREEN_PAGE = '/offscreen.html';

export type CheckMessage =
  | { type: 'tabsurd:check-start' }
  | { type: 'tabsurd:check-stop' }
  | { type: 'tabsurd:check-done' };

export function sendCheckMessage(message: CheckMessage): Promise<void> {
  return browser.runtime.sendMessage(message);
}

/** Background script reply to check messages; `true` means the reply comes later. */
export function onCheckMessage(message: unknown, sendResponse: (response?: unknown) => void): boolean {
  const type = (message as CheckMessage | undefined)?.type;
  const action =
    type === 'tabsurd:check-start'
      ? startCheck
      : type === 'tabsurd:check-stop'
        ? stopCheck
        : type === 'tabsurd:check-done'
          ? finishCheck
          : null;
  if (!action) return false;
  void action().then(
    () => sendResponse(),
    () => sendResponse(),
  );
  return true;
}

async function startCheck(): Promise<void> {
  if (!(await hasSiteAccess())) return;
  await updateCheckState({ running: true, checked: 0, total: 0, startedAt: Date.now(), finishedAt: undefined });
  await ensureOffscreen();
}

async function ensureOffscreen(): Promise<void> {
  if (await hasOffscreen()) return;
  try {
    await browser.offscreen.createDocument({
      url: OFFSCREEN_PAGE,
      reasons: ['DOM_PARSER' as Browser.offscreen.Reason],
      justification: 'Загрузка заголовков и значков сохранённых вкладок',
    });
  } catch (error) {
    // A parallel call may have created the page in the meantime; any other failure is real.
    if (!(await hasOffscreen())) throw error;
  }
}

async function hasOffscreen(): Promise<boolean> {
  const contexts = await browser.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT' as Browser.runtime.ContextType],
  });
  return contexts.length > 0;
}

async function stopCheck(): Promise<void> {
  await updateCheckState({ running: false });
  await closeOffscreen();
}

async function closeOffscreen(): Promise<void> {
  // A parallel call may have closed the page already.
  if (await hasOffscreen()) await browser.offscreen.closeDocument().catch(() => undefined);
}

async function finishCheck(): Promise<void> {
  await updateCheckState({ running: false, finishedAt: Date.now() });
  await closeOffscreen();
}

/** On every background script wake-up an unfinished check (for example after a Chrome restart) continues. */
export async function resumeBackgroundCheck(): Promise<void> {
  if (!(await getCheckState()).running) return;
  if (!(await hasSiteAccess())) {
    await updateCheckState({ running: false });
    return;
  }
  await ensureOffscreen();
}
