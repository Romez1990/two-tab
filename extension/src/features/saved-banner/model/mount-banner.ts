import { browser } from '@/shared/browser';
import type { SavedMatch } from '@/entities/saved';
import { BANNER_PAGE, MATCHES_GLOBAL, type BannerFrameMessage } from './banner';

const FRAME_ID = 'tabsurd-saved-banner';
/**
 * Адрес, на котором плашку закрыли: повторная вставка при полной загрузке её не возвращает. В глобальной
 * переменной, потому что скрипт при каждой вставке выполняется заново.
 */
const CLOSED_GLOBAL = '__tabsurdBannerClosedUrl';
const scope = globalThis as Record<string, unknown>;

/**
 * Вставляет iframe плашки в правый верхний угол. Скрипт вставляется заново при каждой загрузке страницы
 * (и при смене адреса без перезагрузки), поэтому плашка для другого адреса сначала убирается, а для того же — остаётся.
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
