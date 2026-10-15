import { normalize } from '@/shared/lib';

/** Запрос из истории поиска (docs/extension/pages/search.md, раздел 2.1). */
export interface SearchQuery {
  query: string;
  usedAt: number;
  /** Сколько раз запускали. */
  count: number;
}

/** Расстояние Левенштейна, не дальше `limit` (дальше — `limit + 1`). */
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

/** Насколько запрос из истории похож на набранное: 3 — начинается с него, 2 — содержит, 1 — опечатки; 0 — не похож. */
export function similarity(stored: string, typed: string): number {
  const text = normalize(stored);
  const v = normalize(typed.trim());
  if (!v) return 0;
  if (text.startsWith(v)) return 3;
  if (text.includes(v)) return 2;
  // Опечатки сравниваются с началом запроса той же длины: набрано ещё не всё.
  if (v.length >= 3 && editDistance(text.slice(0, v.length), v) <= 2) return 1;
  return 0;
}

/** Пустое поле — недавние сверху; при наборе — похожие, при равенстве выше частые и недавние. */
export function suggest(history: readonly SearchQuery[], typed: string): SearchQuery[] {
  if (!typed.trim()) return [...history].sort((a, b) => b.usedAt - a.usedAt);
  return history
    .map((item) => ({ item, score: similarity(item.query, typed) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || b.item.count - a.item.count || b.item.usedAt - a.item.usedAt)
    .map(({ item }) => item);
}

/** Запуск запроса: повторный не дублируется, а поднимается наверх как самый недавний. */
export function remember(history: readonly SearchQuery[], query: string, now: number): SearchQuery[] {
  const text = query.trim();
  if (!text) return [...history];
  const same = history.find((item) => item.query === text);
  const rest = history.filter((item) => item.query !== text);
  return [{ query: text, usedAt: now, count: (same?.count ?? 0) + 1 }, ...rest];
}
