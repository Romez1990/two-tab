import type { SavedItem } from './types';

/** Tab `from` moves to the place of `to` (indexes as before the move). */
export function moveSavedTab(item: SavedItem, from: number, to: number): SavedItem {
  const tabs = [...item.window.tabs];
  const [tab] = tabs.splice(from, 1);
  if (!tab || from === to) return item;
  tabs.splice(to, 0, tab);
  return { ...item, window: { ...item.window, tabs } };
}

/** Without tab `index`; `undefined` if it was the last tab, then the whole record is deleted. */
export function removeSavedTab(item: SavedItem, index: number): SavedItem | undefined {
  const tabs = item.window.tabs.filter((_, i) => i !== index);
  return tabs.length === 0 ? undefined : { ...item, window: { ...item.window, tabs } };
}
