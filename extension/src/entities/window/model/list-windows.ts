import { browser } from '@/shared/browser';
import type { BrowserWindow, WindowGroup, WindowTab } from './types';

/** Normal Chrome windows (no popups or app windows) with tabs in order. */
export async function listWindows(): Promise<BrowserWindow[]> {
  const [windows, groups] = await Promise.all([
    browser.windows.getAll({ populate: true, windowTypes: ['normal'] }),
    browser.tabGroups.query({}),
  ]);
  const result: BrowserWindow[] = [];
  for (const w of windows) {
    if (w.id === undefined) continue;
    const tabs: WindowTab[] = [];
    for (const t of w.tabs ?? []) {
      if (t.id === undefined) continue;
      tabs.push({ id: t.id, index: t.index, title: t.title ?? '', url: t.url ?? '', pinned: t.pinned, groupId: t.groupId ?? -1 });
    }
    tabs.sort((a, b) => a.index - b.index);
    const windowGroups: WindowGroup[] = groups
      .filter((g) => g.windowId === w.id)
      .map((g) => ({ id: g.id, title: g.title ?? '', color: g.color, size: tabs.filter((t) => t.groupId === g.id).length }))
      .sort((a, b) => (tabs.findIndex((t) => t.groupId === a.id)) - tabs.findIndex((t) => t.groupId === b.id));
    result.push({
      id: w.id,
      focused: w.focused,
      state: w.state ?? 'normal',
      left: w.left,
      top: w.top,
      width: w.width,
      height: w.height,
      tabs,
      groups: windowGroups,
    });
  }
  // Chrome window ids grow: they show the creation order, and so the order on the taskbar.
  return result.sort((a, b) => a.id - b.id);
}
