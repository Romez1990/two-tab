import { knownDownload, pageKind, type PageKind } from '@/entities/download';
import { connectedClient } from '@/shared/api';
import { browser, hasSiteAccess } from '@/shared/browser';

/**
 * Плашка «Скачать» на страницах видео и каналов известных сайтов (docs/extension/pages/site_page.md,
 * раздел 3). Как и «Уже сохранено», её скрипт вставляет фоновый скрипт; сама плашка — страница
 * расширения `download-banner.html` в iframe справа снизу. «Уже скачано» узнаётся у сервиса по адресу,
 * без обращения к сайту.
 */
const BANNER_SCRIPT = '/content-scripts/download-banner-loader.js';
export const DOWNLOAD_BANNER_PAGE = '/download-banner.html';
export const DOWNLOAD_INFO_GLOBAL = '__tabsurdDownloadInfo';

export interface DownloadBannerInfo {
  kind: PageKind;
  /** Где уже скачанное видео сейчас. */
  downloaded: string | null;
}

export type DownloadFrameMessage = { tabsurd: 'download-banner-height'; height: number } | { tabsurd: 'download-banner-close' };

/** Окно «Скачать» для адреса — из плашки и из всплывающего окна. */
export async function openDownloadWindow(url: string): Promise<void> {
  await browser.tabs.create({ url: `${browser.runtime.getURL('/app.html')}#download/${encodeURIComponent(url)}` });
}

const recent = new Set<string>();

export async function showDownloadBanner(tabId: number, url: string | undefined): Promise<void> {
  if (!url || !/^https?:/i.test(url)) return;
  const kind = pageKind(url);
  if (!kind) return;
  // Смена адреса и конец загрузки часто приходят подряд — плашка вставляется один раз.
  const key = `${tabId} ${url}`;
  if (recent.has(key)) return;
  recent.add(key);
  setTimeout(() => recent.delete(key), 2000);
  if (!(await hasSiteAccess()) || !(await connectedClient())) return;
  const downloaded = kind === 'video' ? await knownDownload(url).catch(() => null) : null;
  const info: DownloadBannerInfo = { kind, downloaded };
  try {
    await browser.scripting.executeScript({
      target: { tabId },
      func: (name: string, value: DownloadBannerInfo) => void ((globalThis as Record<string, unknown>)[name] = value),
      args: [DOWNLOAD_INFO_GLOBAL, info],
    });
    await browser.scripting.executeScript({ target: { tabId }, files: [BANNER_SCRIPT as '/content-scripts/download-banner-loader.js'] });
  } catch {
    // Страница закрылась или в неё нельзя вставлять скрипты.
  }
}
