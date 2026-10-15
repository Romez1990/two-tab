import { getSettings } from '@/shared/config';
import type { components } from './schema';

/**
 * The WebSocket `/api/ws` of the local service (docs/extension/queues.md, section 6;
 * tidy-reel/docs/local_service/local_service.md, section 7.7): the key first, then the topics;
 * the service sends snapshots and events itself. Reconnects after 5 seconds, then less often,
 * up to once a minute.
 */

type S = components['schemas'];
/** Fields with defaults may be left out: the generator marks them required. */
export type ServiceTopics = Partial<S['Topics']>;
export type QueueTopic = Partial<S['QueueTopic']>;
export type ServiceMessage =
  | S['AttentionMessage']
  | S['DownloadsMessage']
  | S['RecompressMessage']
  | S['SubscriptionsMessage']
  | S['TrashMessage']
  | S['NeedCookiesMessage']
  | S['SubscriptionFoundMessage']
  | S['SubscriptionDownloadedMessage']
  | S['PingMessage']
  | S['ErrorMessage'];

export const FIRST_RETRY_MS = 5_000;
export const LAST_RETRY_MS = 60_000;

export interface ServiceConnection {
  /** Replace the topics; `{}` — the service only pings. */
  subscribe(topics: ServiceTopics): void;
  close(): void;
}

/** Open the connection; without a key in the settings it waits as if the service did not answer. */
export function connectToService(onMessage: (message: ServiceMessage) => void, onOnline: (online: boolean) => void = () => undefined): ServiceConnection {
  let topics: ServiceTopics = {};
  let socket: WebSocket | null = null;
  let retry: number | null = null;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let closed = false;

  const send = (message: object) => {
    if (socket?.readyState === WebSocket.OPEN) socket.send(JSON.stringify(message));
  };

  const scheduleRetry = () => {
    if (closed) return;
    retry = nextRetryDelay(retry);
    timer = setTimeout(() => void open(), retry);
  };

  const open = async () => {
    const { localServicePort, localServiceKey } = await getSettings();
    if (closed) return;
    if (!localServiceKey) return scheduleRetry();
    const next = new WebSocket(`ws://127.0.0.1:${localServicePort}/api/ws`);
    socket = next;
    next.onopen = () => {
      retry = null;
      next.send(JSON.stringify({ auth: localServiceKey }));
      next.send(JSON.stringify({ subscribe: topics }));
      onOnline(true);
    };
    next.onmessage = (event) => {
      try {
        onMessage(JSON.parse(String(event.data)) as ServiceMessage);
      } catch (error) {
        console.error('Tidy Reel sent a message that is not JSON', error);
      }
    };
    next.onclose = () => {
      if (socket !== next) return;
      socket = null;
      onOnline(false);
      scheduleRetry();
    };
  };

  void open();
  return {
    subscribe(next) {
      topics = next;
      send({ subscribe: topics });
    },
    close() {
      closed = true;
      clearTimeout(timer);
      socket?.close();
      socket = null;
    },
  };
}

/** The pause before the next try: twice the last one, from 5 seconds up to a minute. */
export function nextRetryDelay(last: number | null): number {
  return last === null ? FIRST_RETRY_MS : Math.min(LAST_RETRY_MS, last * 2);
}
