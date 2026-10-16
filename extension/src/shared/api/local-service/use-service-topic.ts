import { useEffect, useRef, useState } from 'react';
import { connectToService, type ServiceConnection, type ServiceMessage, type ServiceTopics } from './realtime';

type TopicName = 'downloads' | 'recompress' | 'subscriptions' | 'trash';
type Snapshot<T extends TopicName> = Extract<ServiceMessage, Record<T, unknown>>[T];

/**
 * A page's own connection with one topic (docs/extension/queues.md, section 6): snapshots come
 * only while the tab is visible — selected in its window, even if the window is not focused.
 * A hidden tab unsubscribes; selected again, it subscribes and gets a fresh snapshot at once.
 */
export function useServiceTopic<T extends TopicName>(
  name: T,
  params: ServiceTopics[T],
): { snapshot: Snapshot<T> | null; online: boolean; error: string } {
  const [snapshot, setSnapshot] = useState<Snapshot<T> | null>(null);
  const [online, setOnline] = useState(true);
  const [error, setError] = useState('');
  const connection = useRef<ServiceConnection | null>(null);
  const topics = useRef<ServiceTopics>({});
  const key = JSON.stringify(params);

  useEffect(() => {
    const current = connectToService((message) => {
      if (name in message) {
        setSnapshot((message as unknown as Record<T, Snapshot<T>>)[name]);
        setError('');
      } else if ('error' in message) setError(message.error);
    }, setOnline);
    connection.current = current;
    const onVisibility = () => current.subscribe(document.visibilityState === 'visible' ? topics.current : {});
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      current.close();
    };
  }, [name]);

  useEffect(() => {
    topics.current = { [name]: params };
    if (document.visibilityState === 'visible') connection.current?.subscribe(topics.current);
  }, [name, key]);

  return { snapshot, online, error };
}
