import { savedItemPageUrl, findSavedByUrl, type SavedMatch } from '@/entities/saved';
import { browser, hasSiteAccess } from '@/shared/browser';

/**
 * Плашка «Уже сохранено» на сайте (docs/extension/specification.md, раздел 2.1). Её скрипт не прописан
 * в манифесте: фоновый скрипт вставляет его, только когда адрес вкладки есть в сохранённых и есть доступ к сайтам.
 * Сама плашка — страница расширения `saved-banner.html` в iframe; найденные записи ей передаются в адресе,
 * чтобы не читать базу второй раз. Плашка вставляется, как только у вкладки начал загружаться новый адрес,
 * не дожидаясь загрузки картинок и прочего.
 */

const BANNER_SCRIPT = '/content-scripts/saved-banner-loader.js';
export const BANNER_PAGE = '/saved-banner.html';

/** Сообщения из iframe плашки в скрипт на странице сайта. */
/** Глобальная переменная изолированного мира скриптов расширения на странице: найденные записи для плашки. */
export const MATCHES_GLOBAL = '__tabsurdSavedMatches';

export type BannerFrameMessage = { tabsurd: 'banner-height'; height: number } | { tabsurd: 'banner-close' };

/** Открывает «Сохранённые» с раскрытой записью — из плашки и из всплывающего окна. */
export async function openSavedItem(id: string): Promise<void> {
  await browser.tabs.create({ url: savedItemPageUrl(id) });
}

/** Страница загрузилась — если её адрес сохранён, на неё вставляется плашка. */
const recent = new Set<string>();

export async function showBannerIfSaved(tabId: number, url: string | undefined, phase: 'start' | 'complete'): Promise<void> {
  if (!url || !/^https?:/i.test(url)) return;
  // Начало загрузки и смена адреса часто приходят двумя событиями подряд — плашка вставляется один раз.
  const key = `${tabId} ${phase} ${url}`;
  if (recent.has(key)) return;
  recent.add(key);
  setTimeout(() => recent.delete(key), 2000);
  if (!(await hasSiteAccess())) return;
  const matches = await findSavedByUrl(url);
  if (matches.length === 0) return;
  try {
    await browser.scripting.executeScript({
      target: { tabId },
      injectImmediately: true,
      func: (name: string, value: SavedMatch[]) => void ((globalThis as Record<string, unknown>)[name] = value),
      args: [MATCHES_GLOBAL, matches],
    });
    await browser.scripting.executeScript({ target: { tabId }, injectImmediately: true, files: [BANNER_SCRIPT as '/content-scripts/saved-banner-loader.js'] });
  } catch {
    // Страница закрылась или в неё нельзя вставлять скрипты (магазин Chrome и т. п.).
  }
}
