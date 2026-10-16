import { parseUrl } from '@/shared/lib';

/** Result of checking a page with a GET request (docs/extension/pages/saved.md, section 1). */
export interface PageCheck {
  url: string;
  /** When it was checked. */
  at: number;
  /** Response code. */
  code?: number;
  /** The site did not respond: no such domain or a timeout. */
  failed?: true;
  /** Where the redirects led, if the address changed. */
  finalUrl?: string;
}

/** Badge on a tab; `null` means the page is fine (or not checked yet). */
export interface StatusBadge {
  label: string;
  color: 'error' | 'warning';
  hint: string;
}

/** 429 and 503 never get here: requests are paused on them and the result is not stored. */
const BLOCKED = new Set([401, 403]);

const REASONS: Record<number, string> = {
  400: 'неверный запрос',
  401: 'нужен вход',
  403: 'доступ запрещён',
  405: 'метод не разрешён',
  408: 'сайт не дождался запроса',
  429: 'слишком много запросов',
  451: 'недоступно по закону',
  500: 'ошибка на сайте',
  502: 'сайт за прокси не ответил',
  503: 'сайт временно недоступен',
  504: 'сайт за прокси не ответил вовремя',
};

export function statusBadge(check: PageCheck | undefined): StatusBadge | null {
  if (!check) return null;
  const { code, url, finalUrl } = check;
  if (check.failed) return { label: 'нет ответа', color: 'error', hint: 'Сайт не ответил: домена нет или он не ответил за 10 секунд.' };
  if (code === undefined) return null;
  if (code === 404) return { label: '404', color: 'error', hint: '404 — страница не найдена.' };
  if (code === 410) return { label: '410', color: 'error', hint: '410 — страница удалена навсегда.' };
  if (BLOCKED.has(code)) {
    return {
      label: 'не пустил',
      color: 'warning',
      hint: `${code} — ${REASONS[code]}: сайт не пустил проверку. Часто это защита от ботов, в браузере страница может открываться.`,
    };
  }
  if (code >= 400) return { label: String(code), color: 'warning', hint: `${code} — ${REASONS[code] ?? (code >= 500 ? 'ошибка на сайте' : 'ошибка запроса')}.` };
  if (finalUrl && isSuspiciousRedirect(url, finalUrl)) return { label: '↪', color: 'warning', hint: `Перенаправляет на ${finalUrl}` };
  return null;
}

/** Redirect to another site or to the home page; a `http`→`https` or `www` change does not count. */
export function isSuspiciousRedirect(from: string, to: string): boolean {
  const a = parseUrl(from);
  const b = parseUrl(to);
  if (!a || !b) return false;
  const host = (u: URL) => u.hostname.replace(/^www\./, '');
  if (host(a) !== host(b)) return true;
  const home = (u: URL) => u.pathname === '/' && !u.search;
  return home(b) && !home(a);
}
