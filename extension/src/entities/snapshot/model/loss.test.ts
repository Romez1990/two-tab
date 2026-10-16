import { describe, expect, it } from 'vitest';
import { findLoss, lossSize } from './loss';
import type { SnapshotWindow } from './types';

const win = (uid: string, urls: string[]): SnapshotWindow => ({
  uid,
  focused: false,
  state: 'normal',
  groups: [],
  tabs: urls.map((url) => ({ url, title: '', pinned: false, active: false, group: -1 })),
});

describe('findLoss', () => {
  it('finds nothing missing', () => {
    const loss = findLoss({ takenAt: 0, windows: [win('a', ['x', 'y'])] }, [win('a', ['y', 'x', 'z'])]);
    expect(lossSize(loss)).toEqual({ windows: 0, tabs: 0 });
  });

  it('finds a missing window and missing tabs, counting repeats', () => {
    const loss = findLoss({ takenAt: 0, windows: [win('a', ['x', 'x', 'y']), win('b', ['p', 'q'])] }, [
      win('a', ['x']),
    ]);
    expect(loss.windows.map((w) => w.uid)).toEqual(['b']);
    expect(loss.tabs.map((x) => [x.window.uid, x.tabs.map((t) => t.url)])).toEqual([['a', ['x', 'y']]]);
    expect(lossSize(loss)).toEqual({ windows: 1, tabs: 4 });
  });
});
