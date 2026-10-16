/** The address with the most frequent domain among the addresses, for example to use its icon as the group icon. */
export function mostCommonHostUrl(urls: readonly string[]): string | undefined {
  const counts = new Map<string, { n: number; url: string }>();
  for (const url of urls) {
    const host = hostOf(url);
    if (!host) continue;
    const c = counts.get(host);
    counts.set(host, { n: (c?.n ?? 0) + 1, url: c?.url ?? url });
  }
  let best: { n: number; url: string } | undefined;
  for (const c of counts.values()) if (!best || c.n > best.n) best = c;
  return best?.url;
}

/** Domain of the address without `www.`; an empty string if the address does not parse. */
export function hostOf(url: string): string {
  return parseUrl(url)?.hostname.replace(/^www\./, '') ?? '';
}

/** Parsed address; `undefined` if it is not a valid URL. */
export function parseUrl(url: string, base?: string): URL | undefined {
  try {
    return new URL(url, base);
  } catch {
    return undefined;
  }
}
