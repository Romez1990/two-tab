/**
 * Queue filters and page in the address (docs/extension/queues.md, section 5), like search:
 * `#downloads?filter=decision,errors&page=2`, only what differs from the defaults.
 */

export const QUEUE_FILTERS = ['active', 'decision', 'unread', 'errors', 'done'] as const;
export type QueueFilter = (typeof QUEUE_FILTERS)[number];

export const FILTER_TITLES: Record<QueueFilter, string> = {
  active: 'Активные',
  decision: 'Нужно решение',
  unread: 'Непрочитанные сообщения',
  errors: 'С ошибками',
  done: 'Выполненные',
};

export interface QueueState {
  filters: QueueFilter[];
  /** From 1, as in the page switcher. */
  page: number;
}

export const DEFAULT_QUEUE_STATE: QueueState = { filters: ['active'], page: 1 };

export function writeQueueState(state: QueueState): string {
  const params = new URLSearchParams();
  if (state.filters.length && !isDefault(state.filters))
    params.set('filter', QUEUE_FILTERS.filter((f) => state.filters.includes(f)).join(','));
  if (state.page > 1) params.set('page', String(state.page));
  // Commas in the filter list stay as is: the address stays human-readable.
  const text = params.toString().replace(/%2C/g, ',');
  return text ? `?${text}` : '';
}

function isDefault(filters: readonly QueueFilter[]): boolean {
  return filters.length === 1 && filters[0] === 'active';
}

/** State from an address like `#downloads?…`. */
export function queueStateOfHash(hash: string): QueueState {
  const at = hash.indexOf('?');
  return at < 0 ? DEFAULT_QUEUE_STATE : readQueueState(hash.slice(at));
}

export function readQueueState(search: string): QueueState {
  const params = new URLSearchParams(search);
  const filter = params.get('filter');
  const filters = filter === null ? [] : QUEUE_FILTERS.filter((f) => filter.split(',').includes(f));
  const page = Number(params.get('page'));
  return {
    filters: filters.length ? filters : DEFAULT_QUEUE_STATE.filters,
    page: Number.isInteger(page) && page > 1 ? page : 1,
  };
}
