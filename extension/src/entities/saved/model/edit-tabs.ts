import type { SavedItem } from './types';

/** Вкладка `from` переезжает на место `to` (номера — до переезда). */
export function moveSavedTab(item: SavedItem, from: number, to: number): SavedItem {
  const tabs = [...item.window.tabs];
  const [tab] = tabs.splice(from, 1);
  if (!tab || from === to) return item;
  tabs.splice(to, 0, tab);
  return { ...item, window: { ...item.window, tabs } };
}

/** Без вкладки `index`; `undefined`, если это была последняя вкладка, — тогда запись удаляется целиком. */
export function removeSavedTab(item: SavedItem, index: number): SavedItem | undefined {
  const tabs = item.window.tabs.filter((_, i) => i !== index);
  return tabs.length === 0 ? undefined : { ...item, window: { ...item.window, tabs } };
}
