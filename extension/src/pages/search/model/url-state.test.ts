import { describe, expect, it } from 'vitest';
import { EMPTY_STATE, readState, writeState } from './url-state';

describe('search state in the address', () => {
  it('keeps only what differs from the defaults', () => {
    expect(writeState(EMPTY_STATE)).toBe('');
    expect(writeState({ ...EMPTY_STATE, query: 'rain | snow' })).toBe('?q=rain+%7C+snow');
    const state = {
      query: 'any:(a | b)',
      sources: ['closed' as const, 'open' as const],
      sort: 'date' as const,
      page: 3,
    };
    expect(writeState(state)).toBe('?q=any%3A%28a+%7C+b%29&in=open%2Cclosed&sort=date&page=3');
    expect(readState(writeState(state))).toEqual({ ...state, sources: ['open', 'closed'] });
  });

  it('reads a missing or broken address as the defaults', () => {
    expect(readState('')).toEqual(EMPTY_STATE);
    expect(readState('?page=-2&sort=x&in=')).toEqual({ ...EMPTY_STATE, sources: [] });
  });
});
