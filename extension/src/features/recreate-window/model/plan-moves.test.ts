import { describe, expect, it } from 'vitest';
import type { WindowTab } from '@/entities/window';
import { planMoves } from './plan-moves';

const tab = (id: number, index: number, groupId = -1): WindowTab => ({
  id, index, groupId, title: '', url: '', pinned: false,
});

describe('planMoves', () => {
  it('пустое окно — нечего переносить', () => {
    expect(planMoves([])).toBeNull();
  });

  it('вкладки вне групп переносятся по одной в исходном порядке', () => {
    expect(planMoves([tab(3, 2), tab(1, 0), tab(2, 1)])).toEqual({
      first: 1,
      rest: [{ kind: 'tab', tabId: 2 }, { kind: 'tab', tabId: 3 }],
    });
  });

  it('группа переносится один раз, на месте первой своей вкладки', () => {
    expect(planMoves([tab(1, 0), tab(2, 1, 7), tab(3, 2, 7), tab(4, 3)])).toEqual({
      first: 1,
      rest: [{ kind: 'group', groupId: 7 }, { kind: 'tab', tabId: 4 }],
    });
  });
});
