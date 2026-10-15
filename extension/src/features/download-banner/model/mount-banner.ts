import { browser } from '@/shared/browser';
import { DOWNLOAD_BANNER_PAGE, DOWNLOAD_INFO_GLOBAL, type DownloadBannerInfo, type DownloadFrameMessage } from './banner';

const FRAME_ID = 'tabsurd-download-banner';
/** Address where the banner was closed: injecting again does not bring it back. */
const CLOSED_GLOBAL = '__tabsurdDownloadBannerClosedUrl';
const scope = globalThis as Record<string, unknown>;

/** Inserts the "Download" banner iframe into the bottom right corner; again on a new address without reload. */
export function mountDownloadBanner(): void {
  if (scope[CLOSED_GLOBAL] === location.href) return;
  const old = document.getElementById(FRAME_ID);
  if (old?.dataset.url === location.href) return;
  old?.remove();
  const info = scope[DOWNLOAD_INFO_GLOBAL] as DownloadBannerInfo | undefined;
  if (!info) return;
  const frame = document.createElement('iframe');
  frame.id = FRAME_ID;
  frame.dataset.url = location.href;
  const query = new URLSearchParams({ url: location.href, kind: info.kind, downloaded: info.downloaded ?? '' });
  frame.src = `${browser.runtime.getURL(DOWNLOAD_BANNER_PAGE as '/')}?${query.toString()}`;
  frame.style.cssText =
    'position:fixed;bottom:16px;right:16px;width:360px;height:0;border:0;z-index:2147483647;color-scheme:normal;' +
    'border-radius:4px;box-shadow:0 4px 16px rgba(0,0,0,.25);background:transparent;';
  const origin = new URL(browser.runtime.getURL('/')).origin;
  const onMessage = (e: MessageEvent) => {
    if (e.origin !== origin || e.source !== frame.contentWindow) return;
    const m = e.data as DownloadFrameMessage;
    if (m.tabsurd === 'download-banner-height') frame.style.height = `${m.height}px`;
    if (m.tabsurd === 'download-banner-close') {
      scope[CLOSED_GLOBAL] = location.href;
      frame.remove();
      window.removeEventListener('message', onMessage);
    }
  };
  window.addEventListener('message', onMessage);
  document.documentElement.append(frame);
}
