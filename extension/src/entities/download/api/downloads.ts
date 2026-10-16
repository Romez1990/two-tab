import { connectedClient, serviceErrorText, type LocalServiceClient, type LocalServiceSchemas } from '@/shared/api';
import { browser } from '@/shared/browser';
import { parseUrl } from '@/shared/lib';

/**
 * Downloading through the local service (tidy-reel/docs/local_service/local_service.md, section 7.4).
 * The extension always passes site cookies: it is not known beforehand whether the video is private (docs/extension/pages/downloads.md).
 */

type S = LocalServiceSchemas;
export type Cookie = S['Cookie'];
export type Check = S['local_service__schemas__downloads__CheckResponse'];
export type ChannelCheck = S['ChannelCheckResponse'];
export type Group = S['GroupModel'];
export type Download = S['DownloadModel'];
export type DownloadsSnapshot = S['DownloadsSnapshot'];
export type DownloadQueue = S['DownloadQueueModel'];
export type GroupSummary = S['GroupSummaryModel'];
export type DownloadItem = S['DownloadItemModel'];
export type DownloadItems = S['DownloadItemsModel'];
export type Filters = S['FiltersModel'];
export type Subscription = S['SubscriptionModel'];

export class NotConnectedError extends Error {
  constructor() {
    super('Профиль не подключён к Tidy Reel (Настройки)');
  }
}

/** How to queue: "Temporarily keep the original" and "Start the queue" (docs/extension/pages/downloads.md, section 0). */
export interface EnqueueOptions {
  keepOriginal: boolean;
  start: boolean;
  musicOnly?: boolean;
}

export type GroupAction = 'pause' | 'resume' | 'cancel' | 'up' | 'down' | 'delete';

export type DownloadAction =
  | 'cancel'
  | 'retry'
  | 'skip'
  | 'open'
  | 'show'
  | 'up'
  | 'down'
  | 'original-open'
  | 'original-done';

/** Access to site cookies: requested on a button click. */
export function requestCookieAccess(url: string): Promise<boolean> {
  return browser.permissions.request({ permissions: ['cookies'], origins: [`${new URL(url).origin}/*`] });
}

export async function knownDownload(url: string): Promise<string | null> {
  return unwrap(await (await client()).POST('/api/downloads/known', { body: { url } })).downloaded;
}

/** Service response or an error with a readable text. */
function unwrap<T>(result: { data?: T; error?: unknown; response: Response }): T {
  if (result.data === undefined) throw new Error(serviceErrorText(result.response.status, result.error));
  return result.data;
}

async function client(): Promise<LocalServiceClient> {
  const c = await connectedClient();
  if (!c) throw new NotConnectedError();
  return c;
}

export async function checkVideo(url: string): Promise<Check> {
  return unwrap(
    await (await client()).POST('/api/downloads/check', { body: { url, cookies: await siteCookies(url) } }),
  );
}

/** Site cookies of the address; empty without site access (the service tries without them). */
export async function siteCookies(url: string): Promise<Cookie[]> {
  const parsed = parseUrl(url);
  if (!parsed) return [];
  const origin = `${parsed.origin}/*`;
  if (!(await browser.permissions.contains({ permissions: ['cookies'], origins: [origin] }))) return [];
  const cookies = await browser.cookies.getAll({ url });
  return cookies.map((c) => ({
    domain: c.domain,
    name: c.name,
    value: c.value,
    path: c.path,
    secure: c.secure,
    expirationDate: c.expirationDate ?? null,
  }));
}

/** Channel before queueing: video count and how many pass the filters; the service keeps the channel list for 10 minutes (tidy-reel/docs/downloader.md, section 6.0). */
export async function checkChannel(
  url: string,
  filters: Filters = { from_end: false, music_only: false },
): Promise<ChannelCheck> {
  return unwrap(
    await (await client()).POST('/api/downloads/channel/check', {
      body: { url, cookies: await siteCookies(url), filters },
    }),
  );
}

export async function enqueueVideo(
  url: string,
  folder: string,
  title: string | null,
  presetEdits: Record<string, unknown> | null,
  options: EnqueueOptions,
): Promise<Group> {
  const body = {
    url,
    folder,
    title,
    preset_edits: presetEdits,
    cookies: await siteCookies(url),
    music_only: options.musicOnly ?? false,
    keep_original: options.keepOriginal,
    start: options.start,
  };
  return unwrap(await (await client()).POST('/api/downloads', { body }));
}

/** A channel is queued at once without waiting for the list: a group showing "counting…". */
export async function enqueueChannel(
  url: string,
  folder: string,
  filters: Filters,
  presetEdits: Record<string, unknown> | null,
  options: EnqueueOptions,
): Promise<Group> {
  const body = {
    url,
    folder,
    filters,
    preset_edits: presetEdits,
    cookies: await siteCookies(url),
    keep_original: options.keepOriginal,
    start: options.start,
  };
  return unwrap(await (await client()).POST('/api/downloads/channel', { body }));
}

export async function subscribe(
  url: string,
  folder: string,
  filters: Filters,
  presetEdits: Record<string, unknown> | null,
  onlyNew: boolean,
): Promise<Subscription> {
  const body = {
    channel_url: url,
    folder,
    filters,
    preset_edits: presetEdits,
    only_new: onlyNew,
    cookies: await siteCookies(url),
  };
  return unwrap(await (await client()).POST('/api/subscriptions', { body }));
}

/** Next video with a message of `kind` (`decision`, `unread`, `errors`) after `after`, wrapping around. */
export async function nextItem(
  kind: string,
  after: number | null,
  filters: readonly string[],
): Promise<{ id: number; page: number } | null> {
  return unwrap(
    await (await client()).GET('/api/downloads/items/next', {
      params: { query: { kind, after: after ?? undefined, filter: filters.join(',') } },
    }),
  );
}

export async function pauseQueue(paused: boolean): Promise<void> {
  done(await (await client()).PUT('/api/downloads/pause', { body: { paused } }));
}

function done(result: { error?: unknown; response: Response }): void {
  if (!result.response.ok) throw new Error(serviceErrorText(result.response.status, result.error));
}

export async function readMessage(id: number): Promise<void> {
  done(
    await (await client()).POST('/api/downloads/messages/{message_id}/read', { params: { path: { message_id: id } } }),
  );
}

/** Archive video from a duplicate message: open, show in folder, VLC from the timestamp. */
export async function messageAction(id: number, action: 'open' | 'show' | 'play'): Promise<void> {
  const c = await client();
  const path = { params: { path: { message_id: id } } };
  if (action === 'open') return done(await c.POST('/api/downloads/messages/{message_id}/open', path));
  if (action === 'show') return done(await c.POST('/api/downloads/messages/{message_id}/show', path));
  done(await c.POST('/api/downloads/messages/{message_id}/play', path));
}

/** Decision on "Duplicate found" (tidy-reel/docs/downloader.md, section 5.1). */
export async function decideDuplicate(id: number, keep: 'old' | 'new' | 'both'): Promise<void> {
  done(
    await (await client()).POST('/api/downloads/{download_id}/duplicate', {
      params: { path: { download_id: id } },
      body: { keep },
    }),
  );
}

/** Cookies of one site the service asked for over the WebSocket (`need_cookies`); it keeps them only in memory. */
export async function sendSiteCookies(url: string): Promise<void> {
  done(await (await client()).POST('/api/downloads/cookies', { body: { sites: { [url]: await siteCookies(url) } } }));
}

export async function groupAction(id: number, action: GroupAction): Promise<void> {
  const c = await client();
  const path = { params: { path: { group_id: id } } };
  if (action === 'pause' || action === 'resume')
    return done(
      await c.POST('/api/downloads/groups/{group_id}/pause', { ...path, body: { paused: action === 'pause' } }),
    );
  if (action === 'cancel') return done(await c.POST('/api/downloads/groups/{group_id}/cancel', path));
  if (action === 'delete') return done(await c.DELETE('/api/downloads/groups/{group_id}', path));
  done(await c.POST('/api/downloads/groups/{group_id}/move', { ...path, body: { steps: action === 'up' ? -1 : 1 } }));
}

export async function downloadAction(id: number, action: DownloadAction): Promise<void> {
  const c = await client();
  const path = { params: { path: { download_id: id } } };
  if (action === 'up' || action === 'down')
    return done(
      await c.POST('/api/downloads/{download_id}/move', { ...path, body: { steps: action === 'up' ? -1 : 1 } }),
    );
  const routes = {
    cancel: '/api/downloads/{download_id}/cancel',
    retry: '/api/downloads/{download_id}/retry',
    skip: '/api/downloads/{download_id}/skip',
    open: '/api/downloads/{download_id}/open',
    show: '/api/downloads/{download_id}/show',
    'original-open': '/api/downloads/{download_id}/original/open',
    'original-done': '/api/downloads/{download_id}/original/done',
  } as const;
  done(await c.POST(routes[action], path));
}

export async function categories(): Promise<string[]> {
  return unwrap(await (await client()).GET('/api/downloads/categories'));
}

export async function createModel(category: string, channelUrl: string, name: string): Promise<string> {
  const folder = unwrap(
    await (await client()).POST('/api/downloads/models', { body: { category, channel_url: channelUrl, name } }),
  ).folder;
  if (!folder) throw new Error('Сервис не создал папку');
  return folder;
}

export async function pickFolder(initial?: string): Promise<string | null> {
  return unwrap(await (await client()).POST('/api/downloads/folders/pick', { body: { initial: initial ?? null } }))
    .folder;
}

export async function updateSubscription(id: number, change: S['UpdateRequest']): Promise<Subscription> {
  return unwrap(
    await (await client()).PUT('/api/subscriptions/{subscription_id}', {
      params: { path: { subscription_id: id } },
      body: change,
    }),
  );
}

export async function unsubscribe(id: number): Promise<void> {
  done(
    await (await client()).DELETE('/api/subscriptions/{subscription_id}', {
      params: { path: { subscription_id: id } },
    }),
  );
}

export async function checkSubscriptionsNow(id?: number): Promise<void> {
  done(await (await client()).POST('/api/subscriptions/check', { body: { id: id ?? null } }));
}
