import { downloadAction, feedCookies, listQueue, listSubscriptions } from '@/entities/download';
import { connectedClient } from '@/shared/api';
import { browser } from '@/shared/browser';
import { watchEvents, type WatchState } from './events';

/**
 * Скачивание в фоне: раз в минуту куки сайтов очереди уходят сервису (после его перезапуска видео ждут
 * их, video-analyzer/docs/downloader.md, раздел 3.2) и показываются уведомления подписок (раздел 7).
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
    [groups, subscriptions] = await Promise.all([listQueue(), listSubscriptions()]);
    await feedCookies(groups);
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
      await browser.notifications.create(`${DOWNLOADED_PREFIX}${event.downloadId}`, {
        type: 'basic',
        iconUrl: browser.runtime.getURL('/icon/128.png'),
        title: 'Скачано',
        message: `${event.title}: скачано видео — ${event.count}`,
        buttons: [{ title: 'Показать в папке' }],
      });
    }
  }
}

/** «Показать в папке» в уведомлении о скачанной группе. */
export async function onSubscriptionButton(id: string): Promise<void> {
  await browser.notifications.clear(id);
  if (!id.startsWith(DOWNLOADED_PREFIX)) return;
  await downloadAction(Number(id.slice(DOWNLOADED_PREFIX.length)), 'show').catch(() => undefined);
}
