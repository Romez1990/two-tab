import { browser, hasSiteAccess, type Browser } from '@/shared/browser';
import { updateCheckState, getCheckState } from './state';

/**
 * Управление фоновой проверкой из фонового скрипта. Сама проверка идёт в служебной скрытой странице
 * `offscreen.html`: фоновый скрипт не умеет разбирать HTML. Остановка — закрытие этой страницы.
 */

const OFFSCREEN_PAGE = '/offscreen.html';

export type CheckMessage = { type: 'tabsurd:check-start' } | { type: 'tabsurd:check-stop' } | { type: 'tabsurd:check-done' };

export function sendCheckMessage(message: CheckMessage): Promise<void> {
  return browser.runtime.sendMessage(message);
}

/** Ответ фонового скрипта на сообщения проверки; `true` — ответ придёт позже. */
export function onCheckMessage(message: unknown, sendResponse: (response?: unknown) => void): boolean {
  const type = (message as CheckMessage | undefined)?.type;
  const action =
    type === 'tabsurd:check-start' ? startCheck : type === 'tabsurd:check-stop' ? stopCheck : type === 'tabsurd:check-done' ? finishCheck : null;
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

async function stopCheck(): Promise<void> {
  await updateCheckState({ running: false });
  await closeOffscreen();
}

async function finishCheck(): Promise<void> {
  await updateCheckState({ running: false, finishedAt: Date.now() });
  await closeOffscreen();
}

/** При каждом пробуждении фонового скрипта: незаконченная проверка (например, после перезапуска Chrome) продолжается. */
export async function resumeBackgroundCheck(): Promise<void> {
  if (!(await getCheckState()).running) return;
  if (!(await hasSiteAccess())) {
    await updateCheckState({ running: false });
    return;
  }
  await ensureOffscreen();
}

async function hasOffscreen(): Promise<boolean> {
  const contexts = await browser.runtime.getContexts({ contextTypes: ['OFFSCREEN_DOCUMENT' as Browser.runtime.ContextType] });
  return contexts.length > 0;
}

async function ensureOffscreen(): Promise<void> {
  if (await hasOffscreen()) return;
  try {
    await browser.offscreen.createDocument({
      url: OFFSCREEN_PAGE,
      reasons: ['DOM_PARSER' as Browser.offscreen.Reason],
      justification: 'Загрузка заголовков и значков сохранённых вкладок',
    });
  } catch {
    // Страницу уже создал параллельный вызов.
  }
}

async function closeOffscreen(): Promise<void> {
  if (await hasOffscreen()) await browser.offscreen.closeDocument().catch(() => undefined);
}
