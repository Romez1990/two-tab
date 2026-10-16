import type { SavedItem } from './types';

/** A saved window or group that has a tab with this address (docs/extension/pages/saved.md, section 1). */
export interface SavedMatch {
  id: string;
  kind: SavedItem['kind'];
  /** Record name, or the title of the first tab when there is none. */
  title: string;
  color?: string | undefined;
  tabs: number;
  savedAt: number;
}

export function findMatches(items: readonly SavedItem[], url: string): SavedMatch[] {
  if (!/^https?:/i.test(url)) return [];
  const key = pageKey(url);
  return items
    .filter((i) => i.window.tabs.some((t) => pageKey(t.url) === key))
    .map((i) => ({
      id: i.id,
      kind: i.kind,
      title: i.title || i.window.tabs[0]?.title || i.window.tabs[0]?.url || '',
      color: i.kind === 'group' ? i.window.groups[0]?.color || undefined : undefined,
      tabs: i.window.tabs.length,
      savedAt: i.savedAt,
    }));
}

/** Address for comparison: without the part after `#`. */
export function pageKey(url: string): string {
  const i = url.indexOf('#');
  return i < 0 ? url : url.slice(0, i);
}
