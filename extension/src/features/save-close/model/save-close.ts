import { markClosingByExtension } from '@/entities/closed-tab';
import { addSaved, type SavedItem } from '@/entities/saved';
import { toSnapshotWindow } from '@/entities/snapshot';
import { getWindowUids, newWindowUid } from '@/entities/window';
import { browser } from '@/shared/browser';

/** Сохранить и закрыть окно (docs/extension/specification.md, раздел 2.1). */
export async function saveAndCloseWindow(windowId: number, reason: SavedItem['reason'] = 'manual'): Promise<SavedItem> {
  const [window, groups, uids] = await Promise.all([
    browser.windows.get(windowId, { populate: true }),
    browser.tabGroups.query({ windowId }),
    getWindowUids(),
  ]);
  const snapshot = toSnapshotWindow(window, window.tabs ?? [], uids.get(windowId) ?? newWindowUid(), new Map(groups.map((g) => [g.id, g])));
  const first = snapshot.tabs[0];
  const item: SavedItem = {
    id: crypto.randomUUID(),
    kind: 'window',
    title: first?.title || first?.url || 'Окно',
    savedAt: Date.now(),
    reason,
    window: snapshot,
  };
  await addSaved(item);
  await browser.windows.remove(windowId);
  return item;
}

/** Сохранить и закрыть группу вкладок. Если в окне больше ничего нет, окно закрывается вместе с ней. */
export async function saveAndCloseGroup(groupId: number, reason: SavedItem['reason'] = 'manual'): Promise<SavedItem> {
  const group = await browser.tabGroups.get(groupId);
  const [window, tabs, uids] = await Promise.all([
    browser.windows.get(group.windowId),
    browser.tabs.query({ groupId }),
    getWindowUids(),
  ]);
  const snapshot = toSnapshotWindow(window, tabs, uids.get(group.windowId) ?? newWindowUid(), new Map([[group.id, group]]));
  const item: SavedItem = {
    id: crypto.randomUUID(),
    kind: 'group',
    title: group.title || snapshot.tabs[0]?.title || 'Группа',
    savedAt: Date.now(),
    reason,
    window: snapshot,
  };
  await addSaved(item);
  const ids = tabs.flatMap((t) => (t.id === undefined ? [] : [t.id]));
  await markClosingByExtension(ids);
  await browser.tabs.remove(ids);
  return item;
}
