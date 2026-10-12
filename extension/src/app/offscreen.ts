import { listSaved } from '@/entities/saved';
import { runBackgroundCheck } from '@/features/background-check';
import { fillIcons, missingIconSites } from '@/features/fetch-favicons';
import { fillTitles, pendingTitleUrls } from '@/features/fetch-titles';

/**
 * Служебная скрытая страница фоновой проверки сохранённых (docs/extension/specification.md, раздел 2.1):
 * сначала заголовки вкладок, потом значки сайтов.
 */
export function startOffscreen(): void {
  void runBackgroundCheck(async (signal, report) => {
    const items = await listSaved();
    const titleUrls = await pendingTitleUrls(items);
    const sites = await missingIconSites(
      items.flatMap((i) => i.window.tabs.map((t) => t.url)),
      signal,
    );
    const total = titleUrls.length + sites.size;
    let checked = 0;
    report(checked, total);
    await fillTitles(titleUrls, items, () => report(++checked, total), signal);
    await fillIcons(sites, () => report(++checked, total), signal);
  });
}
