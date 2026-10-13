/**
 * Бережные запросы к сайтам (docs/extension/pages/saved.md, раздел 1): к одному сайту — по одному запросу
 * и не чаще раза в 10 секунд; на 429 и 503 — пауза (`Retry-After` или 5 минут, каждая следующая вдвое дольше),
 * после трёх таких ответов подряд сайт пропускается, пока жива страница расширения, где идут запросы.
 */

export const SITE_GAP_MS = 10_000;
const PAUSE_MS = 5 * 60_000;
const MAX_STRIKES = 3;
const TIMEOUT_MS = 10_000;

/** Сайт трижды подряд попросил не спешить — до конца проверки к нему не обращаемся. */
export class SiteSkippedError extends Error {
  constructor(host: string) {
    super(`Сайт ${host} пропущен: слишком много запросов`);
  }
}

interface SiteState {
  /** Очередь запросов к сайту: следующий ждёт конца предыдущего. */
  lock: Promise<void>;
  nextAt: number;
  strikes: number;
  skipped: boolean;
}

const sites = new Map<string, SiteState>();

function siteOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

/** Пауза после 429 или 503: из `Retry-After` (секунды или дата), иначе 5 минут, удваиваясь с каждым разом. */
export function pauseAfter(retryAfter: string | null, strike: number, now = Date.now()): number {
  if (retryAfter) {
    const seconds = Number(retryAfter);
    if (Number.isFinite(seconds) && seconds >= 0) return seconds * 1000;
    const date = Date.parse(retryAfter);
    if (!Number.isNaN(date)) return Math.max(0, date - now);
  }
  return PAUSE_MS * 2 ** (strike - 1);
}

function wait(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) return reject(signal.reason);
    const timer = setTimeout(done, Math.max(0, ms));
    function done() {
      signal.removeEventListener('abort', abort);
      resolve();
    }
    function abort() {
      clearTimeout(timer);
      reject(signal.reason);
    }
    signal.addEventListener('abort', abort, { once: true });
  });
}

/**
 * `fetch` с куками браузера и правилами для сайта. Ожидание своей очереди не входит в 10 секунд на ответ.
 * Бросает `SiteSkippedError`, если сайт пропущен, и ошибку `fetch`, если сайт не ответил.
 */
export async function siteFetch(url: string, signal: AbortSignal, init: RequestInit = {}): Promise<Response> {
  const host = siteOf(url);
  let site = sites.get(host);
  if (!site) sites.set(host, (site = { lock: Promise.resolve(), nextAt: 0, strikes: 0, skipped: false }));
  const state = site;
  const previous = state.lock;
  let release!: () => void;
  state.lock = new Promise((r) => (release = r));
  try {
    await previous;
    for (;;) {
      if (state.skipped) throw new SiteSkippedError(host);
      await wait(state.nextAt - Date.now(), signal);
      state.nextAt = Date.now() + SITE_GAP_MS;
      const response = await fetch(url, {
        credentials: 'include',
        redirect: 'follow',
        ...init,
        signal: AbortSignal.any([signal, AbortSignal.timeout(TIMEOUT_MS)]),
      });
      if (response.status !== 429 && response.status !== 503) {
        state.strikes = 0;
        return response;
      }
      state.strikes++;
      if (state.strikes >= MAX_STRIKES) {
        state.skipped = true;
        throw new SiteSkippedError(host);
      }
      state.nextAt = Date.now() + Math.max(SITE_GAP_MS, pauseAfter(response.headers.get('retry-after'), state.strikes));
    }
  } finally {
    release();
  }
}

/**
 * Обрабатывает адреса, сгруппировав их по сайтам: сайты — по `parallel` одновременно, адреса одного сайта —
 * по очереди. Так медленный сайт со своей паузой не держит остальные.
 */
export async function runBySite<T extends string>(
  urls: readonly T[],
  signal: AbortSignal,
  run: (url: T) => Promise<void>,
  parallel = 4,
): Promise<void> {
  const bySite = new Map<string, T[]>();
  for (const url of urls) {
    const host = siteOf(url);
    if (!bySite.has(host)) bySite.set(host, []);
    bySite.get(host)!.push(url);
  }
  const queue = [...bySite.values()];
  const worker = async () => {
    for (let list = queue.shift(); list && !signal.aborted; list = queue.shift()) {
      for (const url of list) {
        if (signal.aborted) return;
        await run(url);
      }
    }
  };
  await Promise.all(Array.from({ length: parallel }, worker));
}
