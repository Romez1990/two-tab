import { browser } from '@/shared/browser';
import { remember, type SearchQuery } from '../model/similar';

/**
 * История запросов поиска (docs/extension/pages/search.md, раздел 2.1). Пока без сервера синхронизации —
 * только на этом компьютере, в `storage.local`; хранится вся.
 */
const KEY = 'searchHistory';

export async function listSearchHistory(): Promise<SearchQuery[]> {
  const stored = await browser.storage.local.get(KEY);
  return (stored[KEY] as SearchQuery[] | undefined) ?? [];
}

export async function rememberSearch(query: string): Promise<SearchQuery[]> {
  const history = remember(await listSearchHistory(), query, Date.now());
  await browser.storage.local.set({ [KEY]: history });
  return history;
}

export async function forgetSearch(query: string): Promise<SearchQuery[]> {
  const history = (await listSearchHistory()).filter((item) => item.query !== query);
  await browser.storage.local.set({ [KEY]: history });
  return history;
}
