import { hostOf } from '@/shared/lib';

/** No title, or only the address or domain in its place, as happens after an import. */
export function needsTitle(tab: { url: string; title: string }): boolean {
  if (!/^https?:\/\//i.test(tab.url)) return false;
  const title = tab.title.trim().toLowerCase().replace(/\/$/, '');
  if (!title) return true;
  const url = tab.url.toLowerCase().replace(/\/$/, '');
  const host = hostOf(tab.url).toLowerCase();
  return title === url || title === url.replace(/^https?:\/\//, '') || title === host || title === `www.${host}`;
}

/** Title from HTML: `<title>`, or `og:title` when there is none. */
export function titleFromHtml(html: string): string | undefined {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const title =
    doc.querySelector('title')?.textContent ??
    doc.querySelector('meta[property="og:title"]')?.getAttribute('content') ??
    '';
  const clean = title.replace(/\s+/g, ' ').trim();
  return clean || undefined;
}

/** Encoding from the response header or from `<meta charset>` at the start of the page. */
export function detectCharset(contentType: string | null, head: string): string {
  const fromHeader = contentType?.match(/charset=["']?([\w-]+)/i)?.[1];
  const fromMeta = head.match(/<meta[^>]+charset=["']?([\w-]+)/i)?.[1];
  return (fromHeader ?? fromMeta ?? 'utf-8').toLowerCase();
}
