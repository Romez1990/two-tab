import type { SavedMatch } from '@/entities/saved';
import { browser } from '@/shared/browser';
import { BANNER_PAGE, type BannerFrameMessage, MATCHES_GLOBAL } from './banner';

const FRAME_ID = 'tabsurd-saved-banner';
/**
 * Address where the banner was closed: injecting again on full load does not bring it back. Kept in a global
 * variable because the script runs anew on every injection.
 */
const CLOSED_GLOBAL = '__tabsurdBannerClosedUrl';
const scope = globalThis as Record<string, unknown>;

/**
 * Inserts the banner iframe into the top right corner. The script is injected anew on every page load
 * (and on an address change without reload), so the banner for another address is removed first, and for the same one it stays.
 */
export function mountSavedBanner(): void {
  if (scope[CLOSED_GLOBAL] === location.href) return;
  const old = document.getElementById(FRAME_ID);
  if (old?.dataset.url === location.href) return;
  old?.remove();
  const matches = scope[MATCHES_GLOBAL] as SavedMatch[] | undefined;
  if (!matches?.length) return;
  const frame = document.createElement('iframe');
  frame.id = FRAME_ID;
  frame.dataset.url = location.href;
  frame.src = `${browser.runtime.getURL(BANNER_PAGE as '/')}?matches=${encodeURIComponent(JSON.stringify(matches))}&url=${encodeURIComponent(location.href)}`;
  frame.style.cssText =
    'position:fixed;top:16px;right:16px;width:400px;height:0;border:0;z-index:2147483647;color-scheme:normal;' +
    'border-radius:4px;box-shadow:0 4px 16px rgba(0,0,0,.25);background:transparent;';
  const origin = new URL(browser.runtime.getURL('/')).origin;
  const onMessage = (e: MessageEvent) => {
    if (e.origin !== origin || e.source !== frame.contentWindow) return;
    const m = e.data as BannerFrameMessage;
    if (m.tabsurd === 'banner-height') frame.style.height = `${m.height}px`;
    if (m.tabsurd === 'banner-close') {
      scope[CLOSED_GLOBAL] = location.href;
      frame.remove();
      window.removeEventListener('message', onMessage);
    }
  };
  window.addEventListener('message', onMessage);
  document.documentElement.append(frame);
}
