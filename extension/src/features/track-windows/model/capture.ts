import type { SnapshotGroup, SnapshotWindow } from '@/entities/snapshot';
import { getWindowUids, newWindowUid, setWindowUids } from '@/entities/window';
import { browser, type Browser } from '@/shared/browser';

/** Что известно о вкладке, чтобы записать её в «Недавно закрытые», когда Chrome сообщит только её номер. */
export interface TabInfo {
  url: string;
  title: string;
}

export function tabUrl(tab: Browser.tabs.Tab): string {
  return tab.url || tab.pendingUrl || '';
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
    const groups: SnapshotGroup[] = [];
    const groupIndex = new Map<number, number>();
    const sorted = [...(w.tabs ?? [])].sort((a, b) => a.index - b.index);
    windows.push({
      uid,
      focused: w.focused,
      state: w.state ?? 'normal',
      left: w.left,
      top: w.top,
      width: w.width,
      height: w.height,
      groups,
      tabs: sorted.map((t) => {
        const url = tabUrl(t);
        if (t.id !== undefined) tabs[t.id] = { url, title: t.title ?? '' };
        let group = -1;
        const g = t.groupId !== undefined && t.groupId !== -1 ? groupsById.get(t.groupId) : undefined;
        if (g) {
          group = groupIndex.get(g.id) ?? groups.length;
          if (group === groups.length) {
            groupIndex.set(g.id, group);
            groups.push({ title: g.title ?? '', color: g.color, collapsed: g.collapsed });
          }
        }
        return { url, title: t.title ?? '', pinned: t.pinned, active: t.active, group };
      }),
    });
  }
  // Закрытые окна выпадают из таблицы номеров, новые получают номер.
  await setWindowUids(liveUids);
  return { windows, tabs };
}
