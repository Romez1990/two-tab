import type { SavedItem } from '@/entities/saved';
import { getWindowUids } from '@/entities/window';
import { browser } from '@/shared/browser';
import { getSettings } from '@/shared/config';
import { db } from '@/shared/db';
import { dayIndex } from '@/shared/lib';
import { findStale } from './find-stale';

const RUN_DAYS_KEY = 'chromeRunDays';
export const AUTO_CLOSE_NOTIFICATION_PREFIX = 'auto-closed:';

/**
 * Closes stale windows and groups: saves them first (`save`), then shows a notification
 * with a "Restore" button. Saving is passed in so that the feature does not depend on another feature.
 */
export async function runAutoClose(save: {
  window: (windowId: number) => Promise<SavedItem>;
  group: (groupId: number) => Promise<SavedItem>;
}): Promise<void> {
  const [runDays, settings, chromeWindows, groups, uids] = await Promise.all([
    recordRunDay(),
    getSettings(),
    browser.windows.getAll({ populate: true, windowTypes: ['normal'] }),
    browser.tabGroups.query({}),
    getWindowUids(),
  ]);
  const targets = findStale({
    windows: chromeWindows.flatMap((w) =>
      w.id === undefined
        ? []
        : [
            {
              id: w.id,
              uid: uids.get(w.id) ?? '',
              tabs: (w.tabs ?? []).map((t) => ({
                url: t.url ?? '',
                pinned: t.pinned,
                lastAccessed: t.lastAccessed,
                groupId: t.groupId ?? -1,
              })),
            },
          ],
    ),
    runDays,
    limitDays: settings.autoCloseDays,
    keepWindowUids: settings.keepWindowUids,
  });
  for (const target of targets) {
    const item = target.kind === 'window' ? await save.window(target.windowId) : await save.group(target.groupId);
    await notifyClosed(item);
  }
}

/** Marks today (starting at 6:00) as a day Chrome was running. */
export async function recordRunDay(now = Date.now()): Promise<number[]> {
  const days = ((await db.meta.get(RUN_DAYS_KEY))?.value as number[] | undefined) ?? [];
  const today = dayIndex(now);
  if (days.includes(today)) return days;
  const next = [...days, today];
  await db.meta.put({ key: RUN_DAYS_KEY, value: next });
  return next;
}

async function notifyClosed(item: SavedItem): Promise<void> {
  await browser.notifications.create(`${AUTO_CLOSE_NOTIFICATION_PREFIX}${item.id}`, {
    type: 'basic',
    iconUrl: browser.runtime.getURL('/icon/128.png'),
    title: item.kind === 'window' ? `Закрыто окно «${item.title}»` : `Закрыта группа «${item.title}»`,
    message: `Вкладок: ${item.window.tabs.length}, их давно не открывали. Сохранено в «Сохранённых».`,
    buttons: [{ title: 'Вернуть' }],
  });
}
