import { db } from '@/shared/db';
import { DAY, hostOf, siteFetch, SiteSkippedError } from '@/shared/lib';
import { faviconUrl } from '@/shared/ui';

/**
 * Значки сайтов, которых нет в кеше Chrome (docs/extension/specification.md, раздел 2.1): расширение загружает
 * страницу сайта, находит в ней `<link rel="icon">` (или берёт `/favicon.ico`) и хранит значок у себя.
 */

const CACHE_KEY = 'siteIcons';
const RETRY_AFTER_MS = 30 * DAY;
const MAX_ICON_BYTES = 200_000;
const PARALLEL = 4;

/** Значок сайта: `data` — картинка в виде data URL; без `data` — не нашёлся, `at` — когда пробовали. */
type IconCache = Record<string, { data?: string; at: number }>;

export async function cachedIcons(): Promise<Map<string, string>> {
  const cache = await readCache();
  return new Map(Object.entries(cache).flatMap(([host, e]) => (e.data ? [[host, e.data] as [string, string]] : [])));
}

/**
 * Сайты, у которых в кеше Chrome только значок по умолчанию и которых нет в своём кеше (или неудача была
 * больше 30 дней назад). Для каждого сайта — адрес одной из его вкладок.
 */
export async function missingIconSites(urls: readonly string[], signal: AbortSignal, now = Date.now()): Promise<Map<string, string>> {
  const cache = await readCache();
  const byHost = new Map<string, string>();
  for (const url of urls) {
    const host = hostOf(url);
    if (!host || byHost.has(host) || !/^https?:/i.test(url)) continue;
    const e = cache[host];
    if (e && (e.data || now - e.at < RETRY_AFTER_MS)) continue;
    byHost.set(host, url);
  }
  const fallback = await chromeIconBytes('https://tabsurd-no-such-site.invalid/');
  const missing = new Map<string, string>();
  await runParallel([...byHost], signal, async ([host, url]) => {
    if (equalBytes(await chromeIconBytes(url), fallback)) missing.set(host, url);
  });
  return missing;
}

/**
 * Загружает значки сайтов; каждый найденный сразу сохраняется и передаётся в `onIcon`. Запросы — через
 * `siteFetch`: сайт, который просил не спешить и был пропущен, не сохраняется и проверится в следующий раз.
 */
export async function fillIcons(
  sites: ReadonlyMap<string, string>,
  onIcon: (host: string, data: string | undefined) => void,
  signal: AbortSignal,
): Promise<void> {
  await runParallel([...sites], signal, async ([host, url]) => {
    let data: string | undefined;
    try {
      data = await fetchSiteIcon(url, signal);
    } catch (e) {
      if (!(e instanceof SiteSkippedError)) throw e;
      onIcon(host, undefined);
      return;
    }
    if (signal.aborted) return;
    await writeCache(host, { data, at: Date.now() });
    onIcon(host, data);
  });
}

async function fetchSiteIcon(pageUrl: string, signal: AbortSignal): Promise<string | undefined> {
  const origin = new URL(pageUrl).origin;
  const candidates: string[] = [];
  try {
    const page = await siteFetch(`${origin}/`, signal);
    if (page.ok) {
      const doc = new DOMParser().parseFromString(await page.text(), 'text/html');
      for (const link of doc.querySelectorAll('link[rel~="icon" i], link[rel="apple-touch-icon" i]')) {
        const href = link.getAttribute('href');
        if (href) candidates.push(new URL(href, page.url).href);
      }
    }
  } catch (e) {
    if (e instanceof SiteSkippedError) throw e;
    // Страница не открылась — остаётся /favicon.ico.
  }
  candidates.push(`${origin}/favicon.ico`);
  for (const url of candidates) {
    if (signal.aborted) return undefined;
    const data = await fetchImage(url, signal);
    if (data) return data;
  }
  return undefined;
}

async function fetchImage(url: string, signal: AbortSignal): Promise<string | undefined> {
  if (url.startsWith('data:image/')) return url;
  try {
    const response = await siteFetch(url, signal);
    const type = response.headers.get('content-type') ?? '';
    if (!response.ok || !(type.startsWith('image/') || url.endsWith('.ico'))) return undefined;
    const blob = await response.blob();
    if (blob.size === 0 || blob.size > MAX_ICON_BYTES) return undefined;
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(type.startsWith('image/') ? blob : new Blob([blob], { type: 'image/x-icon' }));
    });
  } catch (e) {
    if (e instanceof SiteSkippedError) throw e;
    return undefined;
  }
}

/** Картинка, которую Chrome отдаёт из своего кеша значков; для неизвестного сайта — значок по умолчанию. */
async function chromeIconBytes(url: string): Promise<Uint8Array> {
  try {
    return new Uint8Array(await (await fetch(faviconUrl(url, 32))).arrayBuffer());
  } catch {
    return new Uint8Array();
  }
}

function equalBytes(a: Uint8Array, b: Uint8Array): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

async function runParallel<T>(tasks: T[], signal: AbortSignal, run: (task: T) => Promise<void>): Promise<void> {
  const queue = [...tasks];
  const worker = async () => {
    for (let t = queue.shift(); t !== undefined && !signal.aborted; t = queue.shift()) await run(t);
  };
  await Promise.all(Array.from({ length: PARALLEL }, worker));
}

async function readCache(): Promise<IconCache> {
  return ((await db.meta.get(CACHE_KEY))?.value as IconCache | undefined) ?? {};
}

async function writeCache(host: string, entry: { data?: string; at: number }): Promise<void> {
  await db.transaction('rw', db.meta, async () => {
    const cache = await readCache();
    cache[host] = entry;
    await db.meta.put({ key: CACHE_KEY, value: cache });
  });
}
