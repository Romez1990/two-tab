import { listClosedTabs } from '@/entities/closed-tab';
import { listSaved } from '@/entities/saved';
import { listHistory } from '@/entities/snapshot';
import { localServiceClient, type LocalServiceSchemas } from '@/shared/api';
import { browser } from '@/shared/browser';
import { getSettings } from '@/shared/config';
import { matches, relevance, type Condition, type SearchDoc, type SearchSource } from '@/shared/lib';

/** Search sources (docs/extension/pages/search.md, section 1). */
export type Source = SearchSource;

export const SOURCE_TITLES: Record<Source, string> = {
  open: 'Открытые вкладки',
  saved: 'Сохранённые вкладки',
  archive: 'Архив',
  closed: 'Недавно закрытые',
  snapshot: 'Снимки окон',
};

export const DEFAULT_SOURCES: Source[] = ['open', 'saved', 'archive'];

export type Found =
  | { source: 'open'; key: string; title: string; url: string; date: number; rank: number; tabId: number; windowId: number }
  | { source: 'saved'; key: string; title: string; url: string; date: number; rank: number; savedId: string; group: string }
  | { source: 'closed' | 'snapshot'; key: string; title: string; url: string; date: number; rank: number }
  | {
      source: 'archive';
      key: string;
      title: string;
      path: string;
      date: number;
      rank: number;
      fileId: number;
      shortcuts: string[];
    };

export type Sort = 'relevance' | 'date';

/** How many archive videos one search takes: a service page holds up to 200. */
const ARCHIVE_LIMIT = 1000;
const ARCHIVE_PAGE = 200;

export interface SearchOutcome {
  results: Found[];
  /** Archive videos in total; at most ARCHIVE_LIMIT are shown. */
  archiveTotal: number;
  archiveError?: string;
}

/** Search over the selected sources as one combined list. */
export async function search(query: Condition, sources: readonly Source[], sort: Sort): Promise<SearchOutcome> {
  const collectors: Partial<Record<Source, (q: Condition) => Promise<Found[]>>> = {
    open: openTabs,
    saved: savedTabs,
    closed: closedTabs,
    snapshot: snapshotTabs,
  };
  const local = await Promise.all(sources.filter((s) => collectors[s]).map((s) => collectors[s]!(query)));
  let archiveTotal = 0;
  let archiveError: string | undefined;
  const results = local.flat();
  if (sources.includes('archive')) {
    try {
      const archived = await archive(query);
      results.push(...archived.found);
      archiveTotal = archived.total;
    } catch (error) {
      archiveError = error instanceof Error ? error.message : String(error);
    }
  }
  results.sort(sort === 'date' ? (a, b) => b.date - a.date : (a, b) => b.rank - a.rank || b.date - a.date);
  return { results, archiveTotal, archiveError };
}

async function openTabs(query: Condition): Promise<Found[]> {
  const tabs = await browser.tabs.query({});
  return tabs
    .filter((tab) => tab.id !== undefined && matches(query, tabDoc('open', tab.title ?? '', tab.url ?? '')))
    .map((tab) => ({
      source: 'open' as const,
      key: `open:${tab.id}`,
      title: tab.title ?? tab.url ?? '',
      url: tab.url ?? '',
      date: tab.lastAccessed ?? 0,
      rank: relevance(query, { name: tab.title ?? '' }),
      tabId: tab.id!,
      windowId: tab.windowId,
    }));
}

function tabDoc(source: Source, title: string, url: string, group?: string): SearchDoc {
  return { source, name: title, url, group };
}

async function savedTabs(query: Condition): Promise<Found[]> {
  const found: Found[] = [];
  for (const item of await listSaved()) {
    item.window.tabs.forEach((tab, index) => {
      const group = tab.group >= 0 ? (item.window.groups[tab.group]?.title ?? '') : item.title;
      const doc = tabDoc('saved', tab.title, tab.url, group);
      if (!matches(query, doc)) return;
      found.push({
        source: 'saved',
        key: `saved:${item.id}:${index}`,
        title: tab.title || tab.url,
        url: tab.url,
        date: item.savedAt,
        rank: relevance(query, doc),
        savedId: item.id,
        group,
      });
    });
  }
  return found;
}

async function closedTabs(query: Condition): Promise<Found[]> {
  return (await listClosedTabs())
    .filter((tab) => matches(query, tabDoc('closed', tab.title, tab.url)))
    .map((tab) => ({
      source: 'closed' as const,
      key: `closed:${tab.id}`,
      title: tab.title || tab.url,
      url: tab.url,
      date: tab.closedAt,
      rank: relevance(query, { name: tab.title }),
    }));
}

async function snapshotTabs(query: Condition): Promise<Found[]> {
  // The same tab is in many snapshots: it is shown once, with the date of the latest snapshot.
  const byUrl = new Map<string, Found>();
  for (const snapshot of await listHistory()) {
    for (const window of snapshot.windows) {
      for (const tab of window.tabs) {
        if (byUrl.has(tab.url) || !matches(query, tabDoc('snapshot', tab.title, tab.url))) continue;
        byUrl.set(tab.url, {
          source: 'snapshot',
          key: `snapshot:${tab.url}`,
          title: tab.title || tab.url,
          url: tab.url,
          date: snapshot.takenAt,
          rank: relevance(query, { name: tab.title }),
        });
      }
    }
  }
  return [...byUrl.values()];
}

async function archive(query: Condition): Promise<{ found: Found[]; total: number }> {
  const { localServicePort, localServiceKey } = await getSettings();
  const client = localServiceClient(localServicePort, localServiceKey);
  const found: Found[] = [];
  let total = 0;
  for (let page = 0; page * ARCHIVE_PAGE < ARCHIVE_LIMIT; page++) {
    const { data, error } = await client.POST('/api/archive/search', {
      body: { query: query as LocalServiceSchemas['SearchRequest']['query'], sort: 'relevance', page, page_size: ARCHIVE_PAGE },
    });
    if (!data) throw new Error(`Архив не ответил: ${JSON.stringify(error)}`);
    total = data.total;
    for (const video of data.videos) {
      const name = fileName(video.path);
      found.push({
        source: 'archive',
        key: `archive:${video.id}`,
        title: name,
        path: video.path,
        date: Math.floor(video.modified_at_ns / 1e6),
        rank: relevance(query, { name }),
        fileId: video.id,
        shortcuts: video.shortcuts,
      });
    }
    if (found.length >= total) break;
  }
  return { found, total };
}

/** File name from an archive path. */
export function fileName(path: string): string {
  return path.split(/[\\/]/).pop() ?? path;
}

export const ARCHIVE_SHOWN_LIMIT = ARCHIVE_LIMIT;
