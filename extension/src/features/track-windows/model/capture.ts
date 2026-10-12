import { toSnapshotWindow, type SnapshotWindow } from '@/entities/snapshot';
import { getWindowUids, newWindowUid, setWindowUids } from '@/entities/window';
import { browser } from '@/shared/browser';

/** Что известно о вкладке, чтобы записать её в «Недавно закрытые», когда Chrome сообщит только её номер. */
export interface TabInfo {
  url: string;
  title: string;
}

/** Текущие окна в виде снимка. Окнам без постоянного номера номер выдаётся здесь. */
export async function captureWindows(): Promise<{ windows: SnapshotWindow[]; tabs: Record<number, TabInfo> }> {
  const [chromeWindows, chromeGroups, uids] = await Promise.all([
    browser.windows.getAll({ populate: true, windowTypes: ['normal'] }),
    browser.tabGroups.query({}),
    getWindowUids(),
  ]);
  const groupsById = new Map(chromeGroups.map((g) => [g.id, g]));
  const liveUids = new Map<number, string>();
  const windows: SnapshotWindow[] = [];
  const tabs: Record<number, TabInfo> = {};

  for (const w of chromeWindows) {
    if (w.id === undefined) continue;
    const uid = uids.get(w.id) ?? newWindowUid();
    liveUids.set(w.id, uid);
    const snapshot = toSnapshotWindow(w, w.tabs ?? [], uid, groupsById);
    for (const t of w.tabs ?? []) if (t.id !== undefined) tabs[t.id] = { url: t.url || t.pendingUrl || '', title: t.title ?? '' };
    windows.push(snapshot);
  }
  // Закрытые окна выпадают из таблицы номеров, новые получают номер.
  await setWindowUids(liveUids);
  return { windows, tabs };
}
