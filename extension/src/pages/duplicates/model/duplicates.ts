import type { SavedItem } from '@/entities/saved';

/**
 * "Duplicates" (docs/extension/pages/duplicates.md): open and saved tabs with the same address.
 * Same means the same page key, like `page_key` in tidy-reel/docs/web_links.md, section 5.
 */

/** Address tags and tails that do not change the page (like TRACKING_KEYS in web_links.py). */
const TRACKING = new Set(['lang', 'order', 'igsh', 'igshid', 'is_from_webapp', 'sender_device', '_t', '_r', 'from']);

export type Copy =
  | { kind: 'open'; title: string; url: string; tabId: number; windowId: number; windowNumber: number }
  | { kind: 'saved'; title: string; url: string; savedId: string; index: number; place: string };

export interface Duplicate {
  key: string;
  copies: Copy[];
}

export interface OpenTab {
  id: number;
  windowId: number;
  title: string;
  url: string;
}

/** Groups of duplicates, most repeated first; windows are numbered in order, from 1. */
export function findDuplicates(open: readonly OpenTab[], saved: readonly SavedItem[]): Duplicate[] {
  const byKey = new Map<string, Copy[]>();
  const windowNumbers = new Map<number, number>();
  const add = (url: string, copy: Copy) => {
    const key = duplicateKey(url);
    if (!key) return;
    byKey.set(key, [...(byKey.get(key) ?? []), copy]);
  };
  for (const tab of open) {
    if (!windowNumbers.has(tab.windowId)) windowNumbers.set(tab.windowId, windowNumbers.size + 1);
    add(tab.url, {
      kind: 'open',
      title: tab.title,
      url: tab.url,
      tabId: tab.id,
      windowId: tab.windowId,
      windowNumber: windowNumbers.get(tab.windowId)!,
    });
  }
  for (const item of saved) {
    item.window.tabs.forEach((tab, index) => {
      const group = tab.group >= 0 ? item.window.groups[tab.group]?.title : undefined;
      add(tab.url, { kind: 'saved', title: tab.title, url: tab.url, savedId: item.id, index, place: group || item.title });
    });
  }
  return [...byKey.entries()]
    .filter(([, copies]) => copies.length > 1)
    .map(([key, copies]) => ({ key, copies }))
    .sort((a, b) => b.copies.length - a.copies.length || a.key.localeCompare(b.key));
}

/** Page key: without `#…`, tags, `www.`, the `http`/`https` difference, case and the trailing `/`. */
export function duplicateKey(url: string): string | undefined {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return undefined;
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return undefined;
  const params = [...parsed.searchParams].filter(([key]) => !TRACKING.has(key.toLowerCase()) && !key.toLowerCase().startsWith('utm_'));
  const query = params.length ? `?${new URLSearchParams(params).toString()}` : '';
  const host = parsed.hostname.replace(/^www\./, '');
  return `${host}${parsed.pathname}`.replace(/\/+$/, '').toLowerCase() + query.toLowerCase();
}

/** Where the copy is, like "Open, window 3" or "Saved, group 'Music'" (shown in Russian). */
export function placeOf(copy: Copy): string {
  return copy.kind === 'open' ? `Открыта, окно ${copy.windowNumber}` : `Сохранена, группа «${copy.place || 'без названия'}»`;
}
