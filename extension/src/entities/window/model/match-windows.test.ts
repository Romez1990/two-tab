import { describe, expect, it } from 'vitest';
import { matchWindows } from './match-windows';

describe('matchWindows', () => {
  it('matches the same window when more than half of the addresses match, even if some tabs changed', () => {
    const result = matchWindows(
      [
        { uid: 'a', urls: ['1', '2', '3'] },
        { uid: 'b', urls: ['x', 'y'] },
      ],
      [
        { id: 10, urls: ['x', 'y', 'z'] },
        { id: 11, urls: ['1', '2', 'new'] },
      ],
    );
    expect(result).toEqual(
      new Map([
        [11, 'a'],
        [10, 'b'],
      ]),
    );
  });

  it('does not match at exactly half', () => {
    expect(matchWindows([{ uid: 'a', urls: ['1', '2'] }], [{ id: 1, urls: ['1', '3'] }]).size).toBe(0);
  });

  it('gives an old window to only one new window, the one with the larger overlap', () => {
    const result = matchWindows(
      [{ uid: 'a', urls: ['1', '2', '3', '4'] }],
      [
        { id: 1, urls: ['1', '2', '3'] },
        { id: 2, urls: ['1', '2', '3', '4'] },
      ],
    );
    expect(result).toEqual(new Map([[2, 'a']]));
  });
});
