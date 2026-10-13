import { dayIndex } from '@/shared/lib';

export interface StaleInputTab {
  url: string;
  pinned: boolean;
  /** Когда на вкладку переходили последний раз; нет — не закрывать. */
  lastAccessed?: number;
  groupId: number;
}

export interface StaleInputWindow {
  id: number;
  uid: string;
  tabs: StaleInputTab[];
}

export type StaleTarget = { kind: 'window'; windowId: number } | { kind: 'group'; groupId: number };

/**
 * Что закрыть автозакрытием (docs/extension/specification.md, раздел 3.2). Окно или группа устарели, если со дня
 * последнего перехода на любую их вкладку Chrome работал `limitDays` суток или больше. Окно с самой недавней
 * активностью не закрывается никогда — в нём сейчас работают. Окно, устаревшее целиком, закрывается одной записью,
 * иначе закрываются его устаревшие группы.
 */
export function findStale(input: {
  windows: readonly StaleInputWindow[];
  runDays: readonly number[];
  limitDays: number;
  /** «Не закрывать»: окна по постоянному номеру. */
  keepWindowUids: readonly string[];
}): StaleTarget[] {
  const { windows, runDays, limitDays, keepWindowUids } = input;
  if (limitDays <= 0) return [];
  const lastActivity = (tabs: readonly StaleInputTab[]) =>
    tabs.some((t) => t.lastAccessed === undefined) ? Infinity : Math.max(...tabs.map((t) => t.lastAccessed ?? 0));
  const isStale = (tabs: readonly StaleInputTab[]) => {
    if (tabs.length === 0) return false;
    const last = lastActivity(tabs);
    if (last === Infinity) return false;
    const lastDay = dayIndex(last);
    return runDays.filter((d) => d > lastDay).length >= limitDays;
  };
  const newest = windows.reduce<StaleInputWindow | undefined>(
    (best, w) => (!best || lastActivity(w.tabs) > lastActivity(best.tabs) ? w : best),
    undefined,
  );
  const result: StaleTarget[] = [];
  for (const w of windows) {
    if (w === newest || keepWindowUids.includes(w.uid)) continue;
    const pinned = w.tabs.some((t) => t.pinned);
    if (!pinned && isStale(w.tabs)) {
      result.push({ kind: 'window', windowId: w.id });
      continue;
    }
    const groups = new Map<number, StaleInputTab[]>();
    for (const t of w.tabs) if (t.groupId !== -1) groups.set(t.groupId, [...(groups.get(t.groupId) ?? []), t]);
    for (const [groupId, tabs] of groups) {
      if (isStale(tabs)) result.push({ kind: 'group', groupId });
    }
  }
  return result;
}

