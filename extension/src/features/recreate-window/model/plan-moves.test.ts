import { describe, expect, it } from 'vitest';
import type { WindowTab } from '@/entities/window';
import { planMoves } from './plan-moves';

const tab = (id: number, index: number, groupId = -1): WindowTab => ({
  id,
  index,
  groupId,
  title: '',
  url: '',
  pinned: false,
});

describe('planMoves', () => {
  it('moves nothing for an empty window', () => {
    expect(planMoves([])).toBeNull();
  });

  it('moves ungrouped tabs one by one in the original order', () => {
    expect(planMoves([tab(3, 2), tab(1, 0), tab(2, 1)])).toEqual({
      first: 1,
      rest: [
        { kind: 'tab', tabId: 2 },
        { kind: 'tab', tabId: 3 },
      ],
    });
  });

  it('moves a group once, at the place of its first tab', () => {
    expect(planMoves([tab(1, 0), tab(2, 1, 7), tab(3, 2, 7), tab(4, 3)])).toEqual({
      first: 1,
      rest: [
        { kind: 'group', groupId: 7 },
        { kind: 'tab', tabId: 4 },
      ],
    });
  });
});
