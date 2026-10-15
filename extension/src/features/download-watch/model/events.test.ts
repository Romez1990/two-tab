import { describe, expect, it } from 'vitest';
import type { GroupSummary, Subscription } from '@/entities/download';
import { watchEvents } from './events';

const subscription = (checked: string, found: number) => ({ id: 1, title: 'Chan', checked_at: checked, last_found: found }) as Subscription;
const group = (states: string[]) =>
  ({
    id: 7,
    title: 'Chan — новые видео',
    kind: 'subscription',
    paused: false,
    videos: states.length,
    finished: states.filter((s) => s === 'done').length,
    remaining: { count: states.filter((s) => s !== 'done').length, counting: false, approximate: false },
  }) as GroupSummary;

describe('watchEvents', () => {
  it('first run only remembers', () => {
    expect(watchEvents([subscription('t1', 3)], [group(['done'])], undefined).events).toEqual([]);
  });

  it('new videos found and a group downloaded, each once', () => {
    const first = watchEvents([subscription('t1', 0)], [group(['queued', 'done'])], undefined).state;
    const second = watchEvents([subscription('t2', 2)], [group(['done', 'done'])], first);
    expect(second.events).toEqual([
      { kind: 'found', subscriptionId: 1, title: 'Chan', count: 2 },
      { kind: 'downloaded', groupId: 7, title: 'Chan — новые видео', count: 2 },
    ]);
    expect(watchEvents([subscription('t2', 2)], [group(['done', 'done'])], second.state).events).toEqual([]);
  });
});
