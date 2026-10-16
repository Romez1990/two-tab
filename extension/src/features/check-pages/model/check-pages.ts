import { addSaved, getSaved, type SavedItem } from '@/entities/saved';
import { db } from '@/shared/db';
import { DAY, runBySite, SiteSkippedError, siteFetch } from '@/shared/lib';
import { detectCharset, needsTitle, titleFromHtml } from './needs-title';
import type { PageCheck } from './page-status';

/**
 * Checking saved tabs (docs/extension/pages/saved.md, section 1): one GET request per address gives
 * the response code, the address after redirects and the title from `<title>`. Needs site access. Results
 * go to the `pageChecks` table, one record per address.
 */

const RETRY_AFTER_MS = 30 * DAY;

/** Stored address checks; unchecked addresses are not in the result. */
export async function getChecks(urls: readonly string[]): Promise<Map<string, PageCheck>> {
  const found = await db.pageChecks.bulkGet([...urls]);
  return new Map(found.flatMap((c) => (c ? [[c.url, c as unknown as PageCheck]] : [])));
}

/** Tab addresses of `items` not checked in the last 30 days. */
export async function pendingCheckUrls(items: readonly SavedItem[], now = Date.now()): Promise<string[]> {
  const urls = [
    ...new Set(items.flatMap((i) => i.window.tabs.map((t) => t.url).filter((u) => /^https?:\/\//i.test(u)))),
  ];
  const checks = await db.pageChecks.bulkGet(urls);
  // Records without a code and without the "no response" mark are left from title-only loading: check them again.
  return urls.filter((_, n) => {
    const c = checks[n];
    return !c || !('code' in c || 'failed' in c) || now - c.at > RETRY_AFTER_MS;
  });
}

/**
 * Checks pages: different sites in parallel, pages of one site one by one with pauses (`siteFetch`).
 * A found title is written at once to every saved item of `items` that has a tab with this address
 * and no title. `onCheck` is called for every address; `undefined` means the page was skipped (the site asked
 * to slow down), an empty title means there is none or it is not needed.
 */
export async function checkPages(
  urls: readonly string[],
  items: readonly SavedItem[],
  onCheck: (check: PageCheck | undefined, title: string) => void,
  signal: AbortSignal,
): Promise<void> {
  const itemIdsByUrl = new Map<string, Set<string>>();
  for (const item of items)
    for (const t of item.window.tabs) {
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

/** Checks one page and stores the result; no result means the check was stopped or the site skipped. */
export async function checkPage(url: string, signal: AbortSignal): Promise<{ check?: PageCheck; title?: string }> {
  const at = Date.now();
  let check: PageCheck;
  let title: string | undefined;
  try {
    const response = await siteFetch(url, signal);
    check = {
      url,
      at,
      code: response.status,
      ...(response.url && response.url !== url ? { finalUrl: response.url } : {}),
    };
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
    // A stopped check or a skipped site stores nothing: the page is checked next time.
    if (signal.aborted || e instanceof SiteSkippedError) return {};
    check = { url, at, failed: true };
  }
  await db.pageChecks.put({ ...check });
  return { check, title };
}

/** The title is written only to tabs that still have none: edits made in the meantime are not lost. */
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
