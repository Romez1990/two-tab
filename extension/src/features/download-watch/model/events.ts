import type { Group, Subscription } from '@/entities/download';

/** Что фоновый скрипт уже показал: проверки подписок по времени и скачанные группы. */
export interface WatchState {
  checks: Record<string, string>;
  groupsDone: number[];
}

export type WatchEvent =
  | { kind: 'found'; subscriptionId: number; title: string; count: number }
  | { kind: 'downloaded'; groupId: number; title: string; count: number; downloadId: number };

const FINISHED = new Set(['done', 'cancelled', 'error', 'no_music']);

/**
 * Уведомления подписок (video-analyzer/docs/downloader.md, раздел 7): проверка нашла новое; группа
 * подписки скачалась целиком. Первый запуск только запоминает состояние, без уведомлений о прошлом.
 */
export function watchEvents(subscriptions: readonly Subscription[], groups: readonly Group[], state: WatchState | undefined): { events: WatchEvent[]; state: WatchState } {
  const next: WatchState = { checks: {}, groupsDone: [] };
  const events: WatchEvent[] = [];
  for (const s of subscriptions) {
    if (!s.checked_at) continue;
    next.checks[String(s.id)] = s.checked_at;
    if (state && state.checks[String(s.id)] !== s.checked_at && (s.last_found ?? 0) > 0)
      events.push({ kind: 'found', subscriptionId: s.id, title: s.title, count: s.last_found ?? 0 });
  }
  for (const g of groups) {
    if (g.kind !== 'subscription' || !g.downloads.every((d) => FINISHED.has(d.state))) continue;
    next.groupsDone.push(g.id);
    const done = g.downloads.filter((d) => d.state === 'done');
    if (state && !state.groupsDone.includes(g.id) && done.length > 0)
      events.push({ kind: 'downloaded', groupId: g.id, title: g.title, count: done.length, downloadId: done[0]!.id });
  }
  return { events, state: next };
}
