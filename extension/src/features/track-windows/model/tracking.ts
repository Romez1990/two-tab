import { addClosedTab, pruneClosedTabs, takeClosingByExtension } from '@/entities/closed-tab';
import {
  archiveSnapshot,
  findLoss,
  getCurrentSnapshot,
  type Loss,
  lossSize,
  type SnapshotWindow,
  saveCurrentSnapshot,
  tabUrl,
} from '@/entities/snapshot';
import { matchWindows, setWindowUids } from '@/entities/window';
import { type Browser, browser } from '@/shared/browser';
import { db } from '@/shared/db';
import { sleep } from '@/shared/lib';
import { captureWindows, type TabInfo } from './capture';

/**
 * Permanent window snapshot, snapshot history, recently closed tabs and the startup check
 * (docs/extension/pages/recovery.md, section 1; docs/extension/specification.md, section 3.1). All state lives in IndexedDB and `storage.session`,
 * because the background script falls asleep.
 */

const WRITE_DELAY_MS = 1500;
/** On startup Chrome does not open the previous session windows at once. */
const STARTUP_DELAY_MS = 10_000;
export const HISTORY_ALARM = 'snapshot-history';
export const HISTORY_PERIOD_MINUTES = 10;
export const LOSS_NOTIFICATION = 'windows-lost';

const READY_KEY = 'trackingReady';
const TABS_KEY = 'tabInfo';
const LOSS_KEY = 'lastLoss';

let ready: Promise<void> | undefined;
let timer: ReturnType<typeof setTimeout> | undefined;

export async function onTabRemoved(tabId: number, info: Browser.tabs.OnRemovedInfo): Promise<void> {
  scheduleSnapshot();
  // Tabs of a closed window stay in snapshots; "Recently closed" gets only tabs closed one by one.
  if (info.isWindowClosing) return;
  if (await takeClosingByExtension(tabId)) return;
  const tabs = (await browser.storage.session.get(TABS_KEY))[TABS_KEY] as Record<number, TabInfo> | undefined;
  const tab = tabs?.[tabId];
  if (!tab || !tab.url || tab.url.startsWith('chrome://newtab')) return;
  await addClosedTab({ url: tab.url, title: tab.title, closedAt: Date.now() });
}

/** The snapshot is written 1–2 seconds after a change; a series of changes gives one write. */
export function scheduleSnapshot(): void {
  clearTimeout(timer);
  timer = setTimeout(() => {
    void startTracking().then(writeSnapshot);
  }, WRITE_DELAY_MS);
}

/**
 * Called on every background script wake-up. Once per Chrome session (or after an extension reload)
 * the previous snapshot goes to history, windows get permanent ids by address overlap, and if something
 * is missing a notification is shown.
 */
export function startTracking(): Promise<void> {
  ready ??= init();
  return ready;
}

async function init(): Promise<void> {
  if ((await browser.storage.session.get(READY_KEY))[READY_KEY]) return;
  await sleep(STARTUP_DELAY_MS);
  const previous = await getCurrentSnapshot();
  if (previous) await archiveSnapshot(previous);
  const chromeWindows = await browser.windows.getAll({ populate: true, windowTypes: ['normal'] });
  const uids = previous
    ? matchWindows(
        previous.windows.map((w) => ({ uid: w.uid, urls: w.tabs.map((t) => t.url) })),
        chromeWindows.flatMap((w) => (w.id === undefined ? [] : [{ id: w.id, urls: (w.tabs ?? []).map(tabUrl) }])),
      )
    : new Map<number, string>();
  await setWindowUids(uids);
  await browser.storage.session.set({ [READY_KEY]: true });
  const current = await writeSnapshot();
  if (previous && current) {
    const loss = findLoss(previous, current);
    const size = lossSize(loss);
    if (size.windows > 0 || size.tabs > 0) await notifyLoss(loss, size);
  }
}

async function writeSnapshot(): Promise<SnapshotWindow[] | undefined> {
  const { windows, tabs } = await captureWindows();
  await browser.storage.session.set({ [TABS_KEY]: tabs });
  // When Chrome closes, windows close one after another. An empty snapshot would overwrite the last real one.
  if (windows.length === 0) return undefined;
  const previous = await getCurrentSnapshot();
  if (previous && JSON.stringify(previous.windows) === JSON.stringify(windows)) return windows;
  await saveCurrentSnapshot({ takenAt: Date.now(), windows });
  return windows;
}

async function notifyLoss(loss: Loss, size: { windows: number; tabs: number }): Promise<void> {
  await db.meta.put({ key: LOSS_KEY, value: loss });
  const parts = [size.windows > 0 ? `окон: ${size.windows}` : '', `вкладок: ${size.tabs}`].filter(Boolean);
  await browser.notifications.create(LOSS_NOTIFICATION, {
    type: 'basic',
    iconUrl: browser.runtime.getURL('/icon/128.png'),
    title: 'Пропали окна или вкладки',
    message: `По сравнению с прошлым запуском не хватает: ${parts.join(', ')}. Восстановить?`,
    buttons: [{ title: 'Восстановить' }],
    requireInteraction: true,
  });
}

export async function onHistoryAlarm(): Promise<void> {
  await startTracking();
  const current = await getCurrentSnapshot();
  if (current) await archiveSnapshot(current);
  await pruneClosedTabs();
}

export async function ensureHistoryAlarm(): Promise<void> {
  if (!(await browser.alarms.get(HISTORY_ALARM))) {
    await browser.alarms.create(HISTORY_ALARM, { periodInMinutes: HISTORY_PERIOD_MINUTES });
  }
}

export async function getLastLoss(): Promise<Loss | undefined> {
  return (await db.meta.get(LOSS_KEY))?.value as Loss | undefined;
}

export async function clearLastLoss(): Promise<void> {
  await db.meta.delete(LOSS_KEY);
}
