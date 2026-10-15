import type { GroupSummary, Subscription } from '@/entities/download';

/** What the background script has already shown: subscription checks by time and downloaded groups. */
export interface WatchState {
  checks: Record<string, string>;
  groupsDone: number[];
}

export type WatchEvent =
  | { kind: 'found'; subscriptionId: number; title: string; count: number }
  | { kind: 'downloaded'; groupId: number; title: string; count: number };

/**
 * Subscription notifications (tidy-reel/docs/downloader.md, section 7): a check found something new; a subscription
 * group finished downloading. The first run only remembers the state, without notifications about the past.
 */
export function watchEvents(subscriptions: readonly Subscription[], groups: readonly GroupSummary[], state: WatchState | undefined): { events: WatchEvent[]; state: WatchState } {
  const next: WatchState = { checks: {}, groupsDone: [] };
  const events: WatchEvent[] = [];
  for (const s of subscriptions) {
    if (!s.checked_at) continue;
    next.checks[String(s.id)] = s.checked_at;
    if (state && state.checks[String(s.id)] !== s.checked_at && (s.last_found ?? 0) > 0)
      events.push({ kind: 'found', subscriptionId: s.id, title: s.title, count: s.last_found ?? 0 });
  }
  for (const g of groups) {
    // Nothing is left: everything is downloaded, cancelled or failed.
    if (g.kind !== 'subscription' || g.remaining.count > 0 || g.remaining.counting) continue;
    next.groupsDone.push(g.id);
    if (state && !state.groupsDone.includes(g.id) && g.finished > 0) events.push({ kind: 'downloaded', groupId: g.id, title: g.title, count: g.finished });
  }
  return { events, state: next };
}
