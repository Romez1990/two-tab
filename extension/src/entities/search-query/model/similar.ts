import { normalize } from '@/shared/lib';

/** A query from the search history (docs/extension/pages/search.md, section 2.1). */
export interface SearchQuery {
  query: string;
  usedAt: number;
  /** How many times it was run. */
  count: number;
}

/** Levenshtein distance, capped at `limit` (anything farther is `limit + 1`). */
export function editDistance(a: string, b: string, limit = 2): number {
  if (Math.abs(a.length - b.length) > limit) return limit + 1;
  let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const current = [i];
    let best = i;
    for (let j = 1; j <= b.length; j++) {
      const value = Math.min(previous[j]! + 1, current[j - 1]! + 1, previous[j - 1]! + (a[i - 1] === b[j - 1] ? 0 : 1));
      current.push(value);
      best = Math.min(best, value);
    }
    if (best > limit) return limit + 1;
    previous = current;
  }
  return previous[b.length]!;
}

/** How similar a history query is to the typed text: 3 starts with it, 2 contains it, 1 typos; 0 not similar. */
export function similarity(stored: string, typed: string): number {
  const text = normalize(stored);
  const v = normalize(typed.trim());
  if (!v) return 0;
  if (text.startsWith(v)) return 3;
  if (text.includes(v)) return 2;
  // Typos are compared with the query prefix of the same length: the user has not finished typing.
  if (v.length >= 3 && editDistance(text.slice(0, v.length), v) <= 2) return 1;
  return 0;
}

/** Empty field: recent first; while typing: similar ones, ties broken by frequent and recent. */
export function suggest(history: readonly SearchQuery[], typed: string): SearchQuery[] {
  if (!typed.trim()) return [...history].sort((a, b) => b.usedAt - a.usedAt);
  return history
    .map((item) => ({ item, score: similarity(item.query, typed) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || b.item.count - a.item.count || b.item.usedAt - a.item.usedAt)
    .map(({ item }) => item);
}

/** Running a query: a repeated one is not duplicated but moved to the top as the most recent. */
export function remember(history: readonly SearchQuery[], query: string, now: number): SearchQuery[] {
  const text = query.trim();
  if (!text) return [...history];
  const same = history.find((item) => item.query === text);
  const rest = history.filter((item) => item.query !== text);
  return [{ query: text, usedAt: now, count: (same?.count ?? 0) + 1 }, ...rest];
}
