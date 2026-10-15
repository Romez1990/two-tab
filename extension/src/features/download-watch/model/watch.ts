import { downloadAction, feedCookies, getQueue, listItems, listSubscriptions } from '@/entities/download';
import { connectedClient } from '@/shared/api';
import { browser } from '@/shared/browser';
import { watchEvents, type WatchState } from './events';

/**
 * Скачивание в фоне: раз в минуту куки сайтов очереди уходят сервису (после его перезапуска видео ждут
 * их, tidy-reel/docs/downloader.md, раздел 3.2) и показываются уведомления подписок (раздел 7).
 */
export const DOWNLOAD_ALARM = 'download-watch';
export const SUBSCRIPTION_NOTIFICATION_PREFIX = 'subscription:';
const DOWNLOADED_PREFIX = `${SUBSCRIPTION_NOTIFICATION_PREFIX}downloaded:`;
const STATE_KEY = 'downloadWatch';

export async function ensureDownloadAlarm(): Promise<void> {
  if (!(await browser.alarms.get(DOWNLOAD_ALARM))) await browser.alarms.create(DOWNLOAD_ALARM, { periodInMinutes: 1 });
}

export async function onDownloadAlarm(): Promise<void> {
  if (!(await connectedClient())) return;
  let groups;
  let subscriptions;
  try {
    const [queue, active] = await Promise.all([getQueue(), listItems(['active'], 0)]);
    groups = queue.groups;
    subscriptions = await listSubscriptions();
    // Первая страница активных — те видео, что пойдут скоро: им и нужны куки.
    await feedCookies(active.items);
  } catch {
    return; // сервис не запущен: попробуем через минуту
  }
  const stored = (await browser.storage.local.get(STATE_KEY))[STATE_KEY] as WatchState | undefined;
  const { events, state } = watchEvents(subscriptions, groups, stored);
  await browser.storage.local.set({ [STATE_KEY]: state });
  for (const event of events) {
    if (event.kind === 'found') {
      await browser.notifications.create(`${SUBSCRIPTION_NOTIFICATION_PREFIX}found:${event.subscriptionId}:${Date.now()}`, {
        type: 'basic',
        iconUrl: browser.runtime.getURL('/icon/128.png'),
        title: 'Подписки',
        message: `У канала «${event.title}» новых видео: ${event.count}`,
      });
    } else {
      const downloadId = await doneVideoOf(event.groupId);
      if (downloadId === null) continue;
      await browser.notifications.create(`${DOWNLOADED_PREFIX}${downloadId}`, {
        type: 'basic',
        iconUrl: browser.runtime.getURL('/icon/128.png'),
        title: 'Скачано',
        message: `${event.title}: скачано видео — ${event.count}`,
        buttons: [{ title: 'Показать в папке' }],
      });
    }
  }
}

/** Скачанное видео группы — для «Показать в папке»: история страницами, группа встречается редко. */
async function doneVideoOf(groupId: number): Promise<number | null> {
  for (let page = 0; ; page++) {
    const { items, total, page_size } = await listItems(['done'], page).catch(() => ({ items: [], total: 0, page_size: 1 }));
    const found = items.find((d) => d.group_id === groupId && d.state === 'done');
    if (found) return found.id;
    if ((page + 1) * page_size >= total) return null;
  }
}

/** «Показать в папке» в уведомлении о скачанной группе. */
export async function onSubscriptionButton(id: string): Promise<void> {
  await browser.notifications.clear(id);
  if (!id.startsWith(DOWNLOADED_PREFIX)) return;
  await downloadAction(Number(id.slice(DOWNLOADED_PREFIX.length)), 'show').catch(() => undefined);
}
