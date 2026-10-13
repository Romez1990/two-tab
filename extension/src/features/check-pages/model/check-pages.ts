import { getSaved, addSaved, type SavedItem } from '@/entities/saved';
import { db } from '@/shared/db';
import { DAY, runBySite, siteFetch, SiteSkippedError } from '@/shared/lib';
import { detectCharset, needsTitle, titleFromHtml } from './needs-title';
import type { PageCheck } from './page-status';

/**
 * Проверка сохранённых вкладок (docs/extension/pages/saved.md, раздел 1): один GET-запрос на адрес даёт
 * код ответа, адрес после перенаправлений и заголовок из `<title>`. Нужен доступ к сайтам. Результаты —
 * в таблице `pageChecks`, по записи на адрес.
 */

const RETRY_AFTER_MS = 30 * DAY;

/** Сохранённые проверки адресов; непроверенных в ответе нет. */
export async function getChecks(urls: readonly string[]): Promise<Map<string, PageCheck>> {
  const found = await db.pageChecks.bulkGet([...urls]);
  return new Map(found.flatMap((c) => (c ? [[c.url, c as unknown as PageCheck]] : [])));
}

/** Адреса вкладок `items`, которые не проверялись последние 30 дней. */
export async function pendingCheckUrls(items: readonly SavedItem[], now = Date.now()): Promise<string[]> {
  const urls = [...new Set(items.flatMap((i) => i.window.tabs.map((t) => t.url).filter((u) => /^https?:\/\//i.test(u))))];
  const checks = await db.pageChecks.bulkGet(urls);
  // Записи без кода и без отметки «нет ответа» остались от загрузки одних заголовков — их проверяем заново.
  return urls.filter((_, n) => {
    const c = checks[n];
    return !c || !('code' in c || 'failed' in c) || now - c.at > RETRY_AFTER_MS;
  });
}

/**
 * Проверяет страницы: разные сайты параллельно, страницы одного сайта — по очереди с паузами (`siteFetch`).
 * Найденный заголовок сразу записывается во все сохранённые из `items`, где есть вкладка с этим адресом
 * без заголовка. `onCheck` вызывается для каждого адреса; `undefined` — страница пропущена (сайт просил
 * не спешить), пустой заголовок — его нет или он не нужен.
 */
export async function checkPages(
  urls: readonly string[],
  items: readonly SavedItem[],
  onCheck: (check: PageCheck | undefined, title: string) => void,
  signal: AbortSignal,
): Promise<void> {
  const itemIdsByUrl = new Map<string, Set<string>>();
  for (const item of items) for (const t of item.window.tabs) {
    if (!itemIdsByUrl.has(t.url)) itemIdsByUrl.set(t.url, new Set());
    itemIdsByUrl.get(t.url)!.add(item.id);
  }
  await runBySite(urls, signal, async (url) => {
    const { check, title } = await checkPage(url, signal);
    if (signal.aborted) return;
    if (title) for (const id of itemIdsByUrl.get(url) ?? []) await saveTitle(id, url, title);
    onCheck(check, title ?? '');
  });
}

/** Проверяет одну страницу и сохраняет результат; без результата — проверка остановлена или сайт пропущен. */
export async function checkPage(url: string, signal: AbortSignal): Promise<{ check?: PageCheck; title?: string }> {
  const at = Date.now();
  let check: PageCheck;
  let title: string | undefined;
  try {
    const response = await siteFetch(url, signal);
    check = { url, at, code: response.status, ...(response.url && response.url !== url ? { finalUrl: response.url } : {}) };
    if (response.ok && (response.headers.get('content-type') ?? '').includes('html')) {
      const bytes = await response.arrayBuffer();
      const head = new TextDecoder('latin1').decode(bytes.slice(0, 4096));
      let decoder: TextDecoder;
      try {
        decoder = new TextDecoder(detectCharset(response.headers.get('content-type'), head));
      } catch {
        decoder = new TextDecoder('utf-8');
      }
      title = titleFromHtml(decoder.decode(bytes));
    }
  } catch (e) {
    // Остановленная проверка и пропущенный сайт ничего не сохраняют: страница проверится в следующий раз.
    if (signal.aborted || e instanceof SiteSkippedError) return {};
    check = { url, at, failed: true };
  }
  await db.pageChecks.put({ ...check });
  return { check, title };
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
