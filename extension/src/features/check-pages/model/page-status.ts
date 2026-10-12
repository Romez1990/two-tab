/** Результат проверки страницы GET-запросом (docs/extension/specification.md, раздел 2.1). */
export interface PageCheck {
  url: string;
  /** Когда проверяли. */
  at: number;
  /** Код ответа. */
  code?: number;
  /** Сайт не ответил: домена нет или время вышло. */
  failed?: true;
  /** Куда привели перенаправления, если адрес сменился. */
  finalUrl?: string;
}

/** Метка у вкладки; `null` — со страницей всё хорошо (или её ещё не проверяли). */
export interface StatusBadge {
  label: string;
  color: 'error' | 'warning';
  hint: string;
}

/** 429 и 503 сюда не доходят: на них запросы ставятся на паузу, а результат не сохраняется. */
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

/** Перенаправление на другой сайт или на главную страницу; смена `http`→`https` и `www` не в счёт. */
export function isSuspiciousRedirect(from: string, to: string): boolean {
  let a: URL, b: URL;
  try {
    a = new URL(from);
    b = new URL(to);
  } catch {
    return false;
  }
  const host = (u: URL) => u.hostname.replace(/^www\./, '');
  if (host(a) !== host(b)) return true;
  const home = (u: URL) => u.pathname === '/' && !u.search;
  return home(b) && !home(a);
}
