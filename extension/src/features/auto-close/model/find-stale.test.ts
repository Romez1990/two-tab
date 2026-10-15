import { describe, expect, it } from 'vitest';
import { DAY, dayIndex } from '@/shared/lib';
import { findStale, type StaleInputTab } from './find-stale';

const now = new Date(2026, 9, 12, 12).getTime();
const today = dayIndex(now);
/** Chrome ran on each of the last 40 days. */
const runDays = Array.from({ length: 40 }, (_, i) => today - i);
const tab = (daysAgo: number, extra: Partial<StaleInputTab> = {}): StaleInputTab => ({
  url: 'https://example.com/', pinned: false, lastAccessed: now - daysAgo * DAY, groupId: -1, ...extra,
});
const run = (windows: { id: number; uid: string; tabs: StaleInputTab[] }[], keepWindowUids: string[] = [], days = runDays) =>
  findStale({ windows, runDays: days, limitDays: 30, keepWindowUids });

describe('findStale', () => {
  it('окно без переходов 30 дней работы Chrome закрывается, текущее — никогда', () => {
    expect(run([{ id: 1, uid: 'a', tabs: [tab(0)] }, { id: 2, uid: 'b', tabs: [tab(31), tab(35)] }])).toEqual([
      { kind: 'window', windowId: 2 },
    ]);
  });

  it('считаются только дни, когда Chrome работал', () => {
    const fewDays = [today, today - 1, today - 2];
    expect(run([{ id: 1, uid: 'a', tabs: [tab(0)] }, { id: 2, uid: 'b', tabs: [tab(100)] }], [], fewDays)).toEqual([]);
  });

  it('свежая вкладка держит окно, но устаревшая группа в нём закрывается', () => {
    const w = { id: 2, uid: 'b', tabs: [tab(1), tab(40, { groupId: 7 }), tab(33, { groupId: 7 }), tab(2, { groupId: 8 })] };
    expect(run([{ id: 1, uid: 'a', tabs: [tab(0)] }, w])).toEqual([{ kind: 'group', groupId: 7 }]);
  });

  it('«Не закрывать»: окно; закреплённые вкладки', () => {
    const current = { id: 1, uid: 'a', tabs: [tab(0)] };
    expect(run([current, { id: 2, uid: 'b', tabs: [tab(40)] }], ['b'])).toEqual([]);
    expect(run([current, { id: 2, uid: 'b', tabs: [tab(40, { pinned: true })] }])).toEqual([]);
  });
});

