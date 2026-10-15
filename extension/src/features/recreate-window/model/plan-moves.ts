import type { WindowTab } from '@/entities/window';

export type MoveStep = { kind: 'tab'; tabId: number } | { kind: 'group'; groupId: number };

/**
 * Order of moving tabs to the new window: the first tab opens the window, then
 * ungrouped tabs one by one and whole groups, once per group, in the original order.
 */
export function planMoves(tabs: readonly WindowTab[]): { first: number; rest: MoveStep[] } | null {
  const [first, ...others] = [...tabs].sort((a, b) => a.index - b.index);
  if (!first) return null;
  const rest: MoveStep[] = [];
  const movedGroups = new Set<number>(first.groupId === -1 ? [] : [first.groupId]);
  for (const tab of others) {
    if (tab.groupId === -1) {
      rest.push({ kind: 'tab', tabId: tab.id });
    } else if (!movedGroups.has(tab.groupId)) {
      movedGroups.add(tab.groupId);
      rest.push({ kind: 'group', groupId: tab.groupId });
    }
  }
  return { first: first.id, rest };
}
