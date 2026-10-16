import { knownDownload, type PageKind, pageKind } from '@/entities/download';
import { connectedClient, ServiceUnreachableError } from '@/shared/api';
import { browser, hasSiteAccess } from '@/shared/browser';

/**
 * The "Download" banner on video and channel pages of known sites (docs/extension/pages/site_page.md,
 * section 3). Like "Already saved", its script is injected by the background script; the banner itself is the
 * extension page `download-banner.html` in an iframe at the bottom right. "Already downloaded" is asked from the service by address,
 * without contacting the site.
 */
const BANNER_SCRIPT = '/content-scripts/download-banner-loader.js';
export const DOWNLOAD_BANNER_PAGE = '/download-banner.html';
export const DOWNLOAD_INFO_GLOBAL = '__tabsurdDownloadInfo';

export interface DownloadBannerInfo {
  kind: PageKind;
  /** Where the already downloaded video is now. */
  downloaded: string | null;
}

export type DownloadFrameMessage =
  | { tabsurd: 'download-banner-height'; height: number }
  | { tabsurd: 'download-banner-close' };

const recent = new Set<string>();

/** The "Download" window for an address, from the banner and from the popup. */
export async function openDownloadWindow(url: string): Promise<void> {
  await browser.tabs.create({ url: `${browser.runtime.getURL('/app.html')}#download/${encodeURIComponent(url)}` });
}

export async function showDownloadBanner(tabId: number, url: string | undefined): Promise<void> {
  if (!url || !/^https?:/i.test(url)) return;
  const kind = pageKind(url);
  if (!kind) return;
  // An address change and load completion often come back to back: the banner is injected once.
  const key = `${tabId} ${url}`;
  if (recent.has(key)) return;
  recent.add(key);
  setTimeout(() => recent.delete(key), 2000);
  if (!(await hasSiteAccess()) || !(await connectedClient())) return;
  const downloaded = kind === 'video' ? await knownDownload(url).catch(nullIfUnreachable) : null;
  const info: DownloadBannerInfo = { kind, downloaded };
  try {
    await browser.scripting.executeScript({
      target: { tabId },
      func: (name: string, value: DownloadBannerInfo) => void ((globalThis as Record<string, unknown>)[name] = value),
      args: [DOWNLOAD_INFO_GLOBAL, info],
    });
    await browser.scripting.executeScript({
      target: { tabId },
      files: [BANNER_SCRIPT as '/content-scripts/download-banner-loader.js'],
    });
  } catch {
    // The page closed or scripts cannot be injected into it.
  }
}

/** The banner still shows when the service is down, just without "Already downloaded". */
function nullIfUnreachable(error: unknown): null {
  if (error instanceof ServiceUnreachableError) return null;
  throw error;
}
