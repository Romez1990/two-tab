import { addClosedTab, pruneClosedTabs, takeClosingByExtension } from '@/entities/closed-tab';
import {
  archiveSnapshot,
  findLoss,
  tabUrl,
  getCurrentSnapshot,
  lossSize,
  saveCurrentSnapshot,
  type Loss,
  type SnapshotWindow,
} from '@/entities/snapshot';
import { matchWindows, setWindowUids } from '@/entities/window';
import { browser, type Browser } from '@/shared/browser';
import { db } from '@/shared/db';
import { sleep } from '@/shared/lib';
import { captureWindows, type TabInfo } from './capture';

/**
 * Постоянный снимок окон, история снимков, недавно закрытые вкладки и проверка при запуске
 * (docs/extension/specification.md, разделы 2.2 и 2.4). Всё состояние — в IndexedDB и `storage.session`,
 * потому что фоновый скрипт засыпает.
 */

const WRITE_DELAY_MS = 1500;
/** Chrome при запуске открывает окна прошлого сеанса не сразу. */
const STARTUP_DELAY_MS = 10_000;
export const HISTORY_ALARM = 'snapshot-history';
export const HISTORY_PERIOD_MINUTES = 10;
export const LOSS_NOTIFICATION = 'windows-lost';

const READY_KEY = 'trackingReady';
const TABS_KEY = 'tabInfo';
const LOSS_KEY = 'lastLoss';

let ready: Promise<void> | undefined;
let timer: ReturnType<typeof setTimeout> | undefined;

/**
 * Вызывается при каждом пробуждении фонового скрипта. Один раз за сеанс Chrome (или после перезагрузки расширения)
 * прошлый снимок уходит в историю, окна получают постоянные номера по совпадению адресов, и если чего-то
 * не хватает — показывается уведомление.
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

/** Снимок пишется через 1–2 секунды после изменения; серия изменений подряд даёт одну запись. */
export function scheduleSnapshot(): void {
  clearTimeout(timer);
  timer = setTimeout(() => {
    void startTracking().then(writeSnapshot);
  }, WRITE_DELAY_MS);
}

async function writeSnapshot(): Promise<SnapshotWindow[] | undefined> {
  const { windows, tabs } = await captureWindows();
  await browser.storage.session.set({ [TABS_KEY]: tabs });
  // Когда Chrome закрывается, окна закрываются одно за другим. Пустой снимок затёр бы последний настоящий.
  if (windows.length === 0) return undefined;
  const previous = await getCurrentSnapshot();
  if (previous && JSON.stringify(previous.windows) === JSON.stringify(windows)) return windows;
  await saveCurrentSnapshot({ takenAt: Date.now(), windows });
  return windows;
}

export async function onTabRemoved(tabId: number, info: Browser.tabs.OnRemovedInfo): Promise<void> {
  scheduleSnapshot();
  // Вкладки закрытого окна остаются в снимках; в «Недавно закрытые» — только вкладки, закрытые по одной.
  if (info.isWindowClosing) return;
  if (await takeClosingByExtension(tabId)) return;
  const tabs = (await browser.storage.session.get(TABS_KEY))[TABS_KEY] as Record<number, TabInfo> | undefined;
  const tab = tabs?.[tabId];
  if (!tab || !tab.url || tab.url.startsWith('chrome://newtab')) return;
  await addClosedTab({ url: tab.url, title: tab.title, closedAt: Date.now() });
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

export async function getLastLoss(): Promise<Loss | undefined> {
  return (await db.meta.get(LOSS_KEY))?.value as Loss | undefined;
}

export async function clearLastLoss(): Promise<void> {
  await db.meta.delete(LOSS_KEY);
}
