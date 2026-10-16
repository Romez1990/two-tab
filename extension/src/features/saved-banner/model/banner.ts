import { findSavedByUrl, type SavedMatch, savedItemPageUrl } from '@/entities/saved';
import { browser, hasSiteAccess } from '@/shared/browser';

/**
 * The "Already saved" banner on a site (docs/extension/pages/saved.md, section 1). Its script is not listed
 * in the manifest: the background script injects it only when the tab address is saved and there is site access.
 * The banner itself is the extension page `saved-banner.html` in an iframe; the found records are passed in its address
 * so the database is not read twice. The banner is injected as soon as the tab starts loading a new address,
 * without waiting for images and the rest.
 */

const BANNER_SCRIPT = '/content-scripts/saved-banner-loader.js';
export const BANNER_PAGE = '/saved-banner.html';

/** Messages from the banner iframe to the script on the site page. */
/** Global variable of the extension isolated world on the page: found records for the banner. */
export const MATCHES_GLOBAL = '__tabsurdSavedMatches';

export type BannerFrameMessage = { tabsurd: 'banner-height'; height: number } | { tabsurd: 'banner-close' };

/** The page loaded: if its address is saved, the banner is injected into it. */
const recent = new Set<string>();

/** Opens "Saved" with the record expanded and tab `tabUrl` highlighted, from the banner and from the popup. */
export async function openSavedItem(id: string, tabUrl: string): Promise<void> {
  await browser.tabs.create({ url: savedItemPageUrl(id, tabUrl) });
}

export async function showBannerIfSaved(
  tabId: number,
  url: string | undefined,
  phase: 'start' | 'complete',
): Promise<void> {
  if (!url || !/^https?:/i.test(url)) return;
  // Load start and address change often come as two events back to back: the banner is injected once.
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
    await browser.scripting.executeScript({
      target: { tabId },
      injectImmediately: true,
      files: [BANNER_SCRIPT as '/content-scripts/saved-banner-loader.js'],
    });
  } catch {
    // The page closed or scripts cannot be injected into it (Chrome Web Store and the like).
  }
}
