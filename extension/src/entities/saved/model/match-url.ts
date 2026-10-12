import type { SavedItem } from './types';

/** Сохранённое окно или группа, где есть вкладка с этим адресом (docs/extension/specification.md, раздел 2.1). */
export interface SavedMatch {
  id: string;
  kind: SavedItem['kind'];
  /** Название записи, а без него — заголовок первой вкладки. */
  title: string;
  color?: string;
  tabs: number;
  savedAt: number;
}

/** Адрес для сравнения: без части после `#`. */
export function pageKey(url: string): string {
  const i = url.indexOf('#');
  return i < 0 ? url : url.slice(0, i);
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
