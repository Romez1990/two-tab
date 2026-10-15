/**
 * Gentle requests to sites (docs/extension/pages/saved.md, section 1): one request at a time per site
 * and at most once in 10 seconds; on 429 and 503 a pause (`Retry-After` or 5 minutes, each next one twice as long),
 * after three such responses in a row the site is skipped while the extension page making the requests is alive.
 */

export const SITE_GAP_MS = 10_000;
const PAUSE_MS = 5 * 60_000;
const MAX_STRIKES = 3;
const TIMEOUT_MS = 10_000;

/** The site asked to slow down three times in a row: it is not contacted until the check ends. */
export class SiteSkippedError extends Error {
  constructor(host: string) {
    super(`Сайт ${host} пропущен: слишком много запросов`);
  }
}

interface SiteState {
  /** Request queue of a site: the next one waits for the previous to finish. */
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

/** Pause after 429 or 503: from `Retry-After` (seconds or a date), otherwise 5 minutes, doubling each time. */
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
 * `fetch` with browser cookies and the site rules. Waiting for its turn does not count toward the 10 seconds for a response.
 * Throws `SiteSkippedError` if the site is skipped, and the `fetch` error if the site did not respond.
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
 * Processes addresses grouped by site: `parallel` sites at a time, addresses of one site
 * one by one. This way a slow site with its pause does not hold up the rest.
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
