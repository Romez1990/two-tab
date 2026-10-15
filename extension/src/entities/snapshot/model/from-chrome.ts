import type { Browser } from '@/shared/browser';
import type { SnapshotGroup, SnapshotWindow } from './types';

export function tabUrl(tab: Browser.tabs.Tab): string {
  return tab.url || tab.pendingUrl || '';
}

/** A Chrome window as a snapshot window: tabs in order, groups by index in `groups`. */
export function toSnapshotWindow(
  window: Browser.windows.Window,
  tabs: readonly Browser.tabs.Tab[],
  uid: string,
  groupsById: ReadonlyMap<number, Browser.tabGroups.TabGroup>,
): SnapshotWindow {
  const groups: SnapshotGroup[] = [];
  const groupIndex = new Map<number, number>();
  return {
    uid,
    focused: window.focused,
    state: window.state ?? 'normal',
    left: window.left,
    top: window.top,
    width: window.width,
    height: window.height,
    groups,
    tabs: [...tabs]
      .sort((a, b) => a.index - b.index)
      .map((t) => {
        let group = -1;
        const g = t.groupId !== undefined && t.groupId !== -1 ? groupsById.get(t.groupId) : undefined;
        if (g) {
          group = groupIndex.get(g.id) ?? groups.length;
          if (group === groups.length) {
            groupIndex.set(g.id, group);
            groups.push({ title: g.title ?? '', color: g.color, collapsed: g.collapsed });
          }
        }
        return { url: tabUrl(t), title: t.title ?? '', pinned: t.pinned, active: t.active, group };
      }),
  };
}
