import { describe, expect, it } from 'vitest';
import { matchWindows } from './match-windows';

describe('matchWindows', () => {
  it('то же окно, если совпадает больше половины адресов, даже если часть вкладок поменялась', () => {
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

  it('половина — это ещё не то же окно', () => {
    expect(matchWindows([{ uid: 'a', urls: ['1', '2'] }], [{ id: 1, urls: ['1', '3'] }]).size).toBe(0);
  });

  it('одно старое окно достаётся только одному новому — с большим совпадением', () => {
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
