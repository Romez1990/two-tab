import { deleteSaved, type SavedItem } from '@/entities/saved';
import { archiveCurrentSnapshot, type SnapshotTab, type SnapshotWindow } from '@/entities/snapshot';
import { getWindowUids, newWindowUid, setWindowUid } from '@/entities/window';
import { type Browser, browser } from '@/shared/browser';

/** "Open" a saved item: tabs open in the current window in the background, without a group; the record stays in "Saved". */
export async function openSaved(item: SavedItem): Promise<void> {
  // Chrome rejects when there are no normal windows: then a new one is created.
  const target = await browser.windows.getLastFocused({ windowTypes: ['normal'] }).catch(() => undefined);
  if (target?.id === undefined) {
    await browser.windows.create({ url: item.window.tabs.map((t) => t.url) });
    return;
  }
  for (const t of item.window.tabs) await browser.tabs.create({ windowId: target.id, url: t.url, active: false });
}

/** "Restore" a saved item (from the auto-close notification): the window or group opens as it was, the record leaves "Saved". */
export async function returnSaved(item: SavedItem): Promise<void> {
  if (item.kind === 'window') await restoreWindows([item.window]);
  else await restoreGroup(item.window);
  await deleteSaved(item.id);
}

/**
 * Restores windows from a snapshot (docs/extension/pages/recovery.md, section 1). Before restoring, the current windows
 * go to history so that the restore can be undone. All tabs except the first in a window open discarded.
 */
export async function restoreWindows(windows: readonly SnapshotWindow[]): Promise<void> {
  await archiveCurrentSnapshot();
  for (const w of windows) await openWindow(w);
}

async function openWindow(window: SnapshotWindow): Promise<void> {
  const [first, ...rest] = window.tabs;
  if (!first) return;
  const placement: Browser.windows.CreateData =
    window.state === 'normal'
      ? { left: window.left, top: window.top, width: window.width, height: window.height }
      : { state: window.state as Browser.windows.CreateData['state'] };
  const created = await browser.windows.create({ url: first.url, focused: false, ...placement });
  const windowId = created?.id;
  const firstTabId = created?.tabs?.[0]?.id;
  if (windowId === undefined || firstTabId === undefined) throw new Error('Chrome не вернул новое окно');
  // The permanent id moves to the restored window if no such window is open now.
  const taken = new Set((await getWindowUids()).values());
  await setWindowUid(windowId, taken.has(window.uid) ? newWindowUid() : window.uid);
  if (first.pinned) await browser.tabs.update(firstTabId, { pinned: true });
  const restIds: number[] = [];
  for (const t of rest) restIds.push(await createDiscardedTab(windowId, t));
  await applyGroups(window, window.tabs, [firstTabId, ...restIds], windowId);
}

/** A tab without loading the page: created in the background and discarded as soon as Chrome knows its address. */
async function createDiscardedTab(windowId: number, tab: SnapshotTab): Promise<number> {
  const created = await browser.tabs.create({ windowId, url: tab.url, pinned: tab.pinned, active: false });
  const id = created.id;
  if (id === undefined) throw new Error('Chrome не вернул вкладку');
  // The user may close or open the tab before it is discarded: then it simply stays loaded.
  void waitForUrl(id)
    .then(() => browser.tabs.discard(id))
    .catch(() => undefined);
  return id;
}

function waitForUrl(tabId: number, timeoutMs = 3000): Promise<void> {
  return new Promise((resolve) => {
    const done = () => {
      browser.tabs.onUpdated.removeListener(listener);
      clearTimeout(timer);
      resolve();
    };
    const listener = (id: number, change: Browser.tabs.OnUpdatedInfo) => {
      if (id === tabId && (change.url || change.status === 'loading')) done();
    };
    const timer = setTimeout(done, timeoutMs);
    browser.tabs.onUpdated.addListener(listener);
  });
}

async function applyGroups(
  window: SnapshotWindow,
  tabs: readonly SnapshotTab[],
  tabIds: readonly number[],
  windowId: number,
): Promise<void> {
  const byGroup = new Map<number, number[]>();
  tabs.forEach((t, i) => {
    const id = tabIds[i];
    if (t.group === -1 || id === undefined) return;
    byGroup.set(t.group, [...(byGroup.get(t.group) ?? []), id]);
  });
  for (const [index, ids] of byGroup) {
    const group = window.groups[index];
    const [firstId, ...otherIds] = ids;
    if (!group || firstId === undefined) continue;
    const groupId = await browser.tabs.group({ tabIds: [firstId, ...otherIds], createProperties: { windowId } });
    await browser.tabGroups.update(groupId, {
      title: group.title,
      // Imported groups have no color: Chrome picks one itself.
      ...(group.color ? { color: group.color as Browser.tabGroups.Color } : {}),
      collapsed: group.collapsed,
    });
  }
}

/** Opens a group in the last focused window (or in a new one if there are no windows). */
export async function restoreGroup(group: SnapshotWindow): Promise<void> {
  // Chrome rejects when there are no normal windows: then a new one is created.
  const target = await browser.windows.getLastFocused({ windowTypes: ['normal'] }).catch(() => undefined);
  const uid = target?.id !== undefined ? (await getWindowUids()).get(target.id) : undefined;
  await restoreTabs({ ...group, uid: uid ?? newWindowUid() }, group.tabs);
}

/** Adds missing tabs to the open window with this permanent id, or to a new window if there is none. */
export async function restoreTabs(window: SnapshotWindow, tabs: readonly SnapshotTab[]): Promise<void> {
  await archiveCurrentSnapshot();
  const windowId = await findWindowId(window.uid);
  if (windowId === undefined) {
    await openWindow({ ...window, tabs: [...tabs] });
    return;
  }
  const created = await Promise.all(tabs.map((t) => createDiscardedTab(windowId, t)));
  await applyGroups(window, tabs, created, windowId);
}

async function findWindowId(uid: string): Promise<number | undefined> {
  for (const [id, u] of await getWindowUids()) {
    if (u !== uid) continue;
    const exists = await browser.windows.get(id).then(
      () => true,
      () => false,
    );
    if (exists) return id;
  }
  return undefined;
}
