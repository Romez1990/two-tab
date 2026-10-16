import { type SnapshotWindow, toSnapshotWindow } from '@/entities/snapshot';
import { getWindowUids, newWindowUid, setWindowUids } from '@/entities/window';
import { browser } from '@/shared/browser';

/** What is known about a tab, to record it in "Recently closed" when Chrome reports only its id. */
export interface TabInfo {
  url: string;
  title: string;
}

/** Current windows as a snapshot. Windows without a permanent id get one here. */
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
    for (const t of w.tabs ?? [])
      if (t.id !== undefined) tabs[t.id] = { url: t.url || t.pendingUrl || '', title: t.title ?? '' };
    windows.push(snapshot);
  }
  // Closed windows drop out of the id table, new ones get an id.
  await setWindowUids(liveUids);
  return { windows, tabs };
}
