import { downloadAction, sendSiteCookies } from '@/entities/download';
import { saveAttention } from '@/entities/queue';
import { connectToService, type ServiceConnection, type ServiceMessage } from '@/shared/api';
import { browser } from '@/shared/browser';

/**
 * The background script's connection with Tidy Reel (docs/extension/queues.md, section 6): the
 * "attention" topic goes into session storage for the banners and the popup, the service asks for
 * the cookies of a site itself, the subscription events become notifications
 * (tidy-reel/docs/downloader.md, section 7). No alarm: the service's `ping` keeps the script awake.
 */
export const SUBSCRIPTION_NOTIFICATION_PREFIX = 'subscription:';
const DOWNLOADED_PREFIX = `${SUBSCRIPTION_NOTIFICATION_PREFIX}downloaded:`;

let connection: ServiceConnection | null = null;

/** Open the connection once per wake-up of the background script. */
export function startServiceEvents(): void {
  if (connection) return;
  connection = connectToService(
    (message) => void onServiceMessage(message),
    (online) => {
      // Without a connection there is nothing to show: no banner, no numbers.
      if (!online) void saveAttention(null);
    },
  );
  connection.subscribe({ attention: true });
}

async function onServiceMessage(message: ServiceMessage): Promise<void> {
  if ('attention' in message) await saveAttention(message.attention);
  else if ('need_cookies' in message)
    await sendSiteCookies(message.need_cookies).catch((error: unknown) =>
      console.error('cookies for Tidy Reel failed', error),
    );
  else if ('subscription_found' in message) await notifyFound(message.subscription_found);
  else if ('subscription_downloaded' in message) await notifyDownloaded(message.subscription_downloaded);
}

async function notifyFound(event: { subscription_id: number; title: string; count: number }): Promise<void> {
  await browser.notifications.create(
    `${SUBSCRIPTION_NOTIFICATION_PREFIX}found:${event.subscription_id}:${Date.now()}`,
    {
      type: 'basic',
      iconUrl: browser.runtime.getURL('/icon/128.png'),
      title: 'Подписки',
      message: `У канала «${event.title}» новых видео: ${event.count}`,
    },
  );
}

async function notifyDownloaded(event: {
  group_id: number;
  title: string;
  count: number;
  download_id: number | null;
}): Promise<void> {
  await browser.notifications.create(`${DOWNLOADED_PREFIX}${event.download_id ?? ''}`, {
    type: 'basic',
    iconUrl: browser.runtime.getURL('/icon/128.png'),
    title: 'Скачано',
    message: `${event.title}: скачано видео — ${event.count}`,
    buttons: event.download_id === null ? [] : [{ title: 'Показать в папке' }],
  });
}

/** "Show in folder" in the notification about a downloaded subscription group. */
export async function onSubscriptionButton(id: string): Promise<void> {
  await browser.notifications.clear(id);
  const downloadId = Number(id.slice(DOWNLOADED_PREFIX.length));
  if (!id.startsWith(DOWNLOADED_PREFIX) || !downloadId) return;
  await downloadAction(downloadId, 'show').catch((error: unknown) => console.error('show in folder failed', error));
}
