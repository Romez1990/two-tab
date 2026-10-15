import { listSaved } from '@/entities/saved';
import { runBackgroundCheck } from '@/features/background-check';
import { fillIcons, missingIconSites } from '@/features/fetch-favicons';
import { checkPages, pendingCheckUrls } from '@/features/check-pages';

/**
 * Hidden service page of the background check of saved items (docs/extension/pages/saved.md, section 1):
 * tab pages first (status and title), then site icons.
 */
export function startOffscreen(): void {
  void runBackgroundCheck(async (signal, report) => {
    const items = await listSaved();
    const pageUrls = await pendingCheckUrls(items);
    const sites = await missingIconSites(
      items.flatMap((i) => i.window.tabs.map((t) => t.url)),
      signal,
    );
    const total = pageUrls.length + sites.size;
    let checked = 0;
    report(checked, total);
    await checkPages(pageUrls, items, () => report(++checked, total), signal);
    await fillIcons(sites, () => report(++checked, total), signal);
  });
}
