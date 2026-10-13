import { listSaved } from '@/entities/saved';
import { runBackgroundCheck } from '@/features/background-check';
import { fillIcons, missingIconSites } from '@/features/fetch-favicons';
import { checkPages, pendingCheckUrls } from '@/features/check-pages';

/**
 * Служебная скрытая страница фоновой проверки сохранённых (docs/extension/pages/saved.md, раздел 1):
 * сначала страницы вкладок (статус и заголовок), потом значки сайтов.
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
