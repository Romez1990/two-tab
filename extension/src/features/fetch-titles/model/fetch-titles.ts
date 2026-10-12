import { getSaved, addSaved, type SavedItem } from '@/entities/saved';
import { db } from '@/shared/db';
import { DAY } from '@/shared/lib';
import { detectCharset, needsTitle, titleFromHtml } from './needs-title';

/**
 * Настоящие заголовки для сохранённых вкладок без заголовка (docs/extension/specification.md, раздел 2.1):
 * страница загружается, заголовок берётся из `<title>`. Нужен доступ к сайтам — необязательное разрешение.
 * Когда страницу загружали последний раз, хранится в таблице `pageChecks`, по записи на адрес.
 */

const RETRY_AFTER_MS = 30 * DAY;
const TIMEOUT_MS = 10_000;
const PARALLEL = 4;

/** Адреса вкладок `items`, которым нужен заголовок и которые не загружались последние 30 дней. */
export async function pendingTitleUrls(items: readonly SavedItem[], now = Date.now()): Promise<string[]> {
  const urls = [...new Set(items.flatMap((i) => i.window.tabs.filter(needsTitle).map((t) => t.url)))];
  const checks = await db.pageChecks.bulkGet(urls);
  return urls.filter((_, n) => now - (checks[n]?.at ?? 0) > RETRY_AFTER_MS);
}

/**
 * Загружает заголовки по несколько страниц одновременно. Каждый найденный заголовок сразу записывается
 * во все сохранённые, где есть вкладка с этим адресом без заголовка. `onTitle` вызывается для каждого
 * проверенного адреса; пустой заголовок — страница не ответила или заголовка в ней нет.
 */
export async function fillTitles(
  urls: readonly string[],
  items: readonly SavedItem[],
  onTitle: (url: string, title: string) => void,
  signal: AbortSignal,
): Promise<void> {
  const itemIdsByUrl = new Map<string, Set<string>>();
  for (const item of items) for (const t of item.window.tabs) {
    if (!itemIdsByUrl.has(t.url)) itemIdsByUrl.set(t.url, new Set());
    itemIdsByUrl.get(t.url)!.add(item.id);
  }
  const queue = [...urls];
  const worker = async () => {
    for (let url = queue.shift(); url !== undefined && !signal.aborted; url = queue.shift()) {
      const title = await fetchTitle(url, signal);
      if (signal.aborted) return;
      await db.pageChecks.put({ url, at: Date.now() });
      if (title) for (const id of itemIdsByUrl.get(url) ?? []) await saveTitle(id, url, title);
      onTitle(url, title ?? '');
    }
  };
  await Promise.all(Array.from({ length: PARALLEL }, worker));
}

async function fetchTitle(url: string, signal: AbortSignal): Promise<string | undefined> {
  const timeout = AbortSignal.timeout(TIMEOUT_MS);
  try {
    const response = await fetch(url, { signal: AbortSignal.any([signal, timeout]), credentials: 'include', redirect: 'follow' });
    if (!response.ok || !(response.headers.get('content-type') ?? '').includes('html')) return undefined;
    const bytes = await response.arrayBuffer();
    const head = new TextDecoder('latin1').decode(bytes.slice(0, 4096));
    let decoder: TextDecoder;
    try {
      decoder = new TextDecoder(detectCharset(response.headers.get('content-type'), head));
    } catch {
      decoder = new TextDecoder('utf-8');
    }
    return titleFromHtml(decoder.decode(bytes));
  } catch {
    return undefined;
  }
}

/** Заголовок записывается только вкладкам, у которых его всё ещё нет: правки, сделанные тем временем, не теряются. */
async function saveTitle(itemId: string, url: string, title: string): Promise<void> {
  const item = await getSaved(itemId);
  if (!item) return;
  let changed = false;
  const tabs = item.window.tabs.map((t) => {
    if (t.url !== url || !needsTitle(t)) return t;
    changed = true;
    return { ...t, title };
  });
  if (changed) await addSaved({ ...item, window: { ...item.window, tabs } });
}
