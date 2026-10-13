/**
 * Сопоставляет открытые окна с окнами прошлого снимка после перезапуска (docs/extension/specification.md, раздел 3.1):
 * то же окно, если в нём есть больше половины адресов старого окна. Пары берутся по убыванию совпадения.
 */
export function matchWindows(
  previous: readonly { uid: string; urls: readonly string[] }[],
  current: readonly { id: number; urls: readonly string[] }[],
): Map<number, string> {
  const pairs: { id: number; uid: string; score: number }[] = [];
  for (const old of previous) {
    if (old.urls.length === 0) continue;
    for (const now of current) {
      const score = common(old.urls, now.urls) / old.urls.length;
      if (score > 0.5) pairs.push({ id: now.id, uid: old.uid, score });
    }
  }
  pairs.sort((a, b) => b.score - a.score);
  const result = new Map<number, string>();
  const usedUids = new Set<string>();
  for (const p of pairs) {
    if (result.has(p.id) || usedUids.has(p.uid)) continue;
    result.set(p.id, p.uid);
    usedUids.add(p.uid);
  }
  return result;
}

/** Число общих адресов с учётом повторов. */
function common(a: readonly string[], b: readonly string[]): number {
  const left = new Map<string, number>();
  for (const url of b) left.set(url, (left.get(url) ?? 0) + 1);
  let n = 0;
  for (const url of a) {
    const k = left.get(url) ?? 0;
    if (k > 0) {
      left.set(url, k - 1);
      n++;
    }
  }
  return n;
}
