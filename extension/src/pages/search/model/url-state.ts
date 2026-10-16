import { SEARCH_SOURCES } from '@/shared/lib';
import { DEFAULT_SOURCES, type Sort, type Source } from './collect';

/**
 * Search in the page address (docs/extension/pages/search.md, section 4): the run query, the "where to search"
 * checkboxes, sorting and page number, only what differs from the defaults.
 */
export interface SearchState {
  query: string;
  sources: Source[];
  sort: Sort;
  page: number;
}

export const EMPTY_STATE: SearchState = { query: '', sources: DEFAULT_SOURCES, sort: 'relevance', page: 1 };

export function readState(search: string): SearchState {
  const params = new URLSearchParams(search);
  const sources = params.get('in');
  const page = Number(params.get('page'));
  return {
    query: params.get('q') ?? '',
    sources: sources === null ? DEFAULT_SOURCES : SEARCH_SOURCES.filter((s) => sources.split(',').includes(s)),
    sort: params.get('sort') === 'date' ? 'date' : 'relevance',
    page: Number.isInteger(page) && page > 1 ? page : 1,
  };
}

export function writeState(state: SearchState): string {
  const params = new URLSearchParams();
  if (state.query) params.set('q', state.query);
  if (!sameSources(state.sources, DEFAULT_SOURCES))
    params.set('in', SEARCH_SOURCES.filter((s) => state.sources.includes(s)).join(','));
  if (state.sort !== 'relevance') params.set('sort', state.sort);
  if (state.page > 1) params.set('page', String(state.page));
  const text = params.toString();
  return text ? `?${text}` : '';
}

function sameSources(a: readonly Source[], b: readonly Source[]): boolean {
  return a.length === b.length && a.every((s) => b.includes(s));
}
