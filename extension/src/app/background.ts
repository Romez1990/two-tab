import { browser, type Browser } from '@/shared/browser';

/** После установки открывается страница «Первый запуск» (docs/extension/specification.md, раздел 1.1). */
export async function onExtensionInstalled(details: Browser.runtime.InstalledDetails): Promise<void> {
  if (details.reason !== 'install') return;
  await browser.tabs.create({ url: browser.runtime.getURL('/onboarding.html') });
}
