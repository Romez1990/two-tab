import { describe, expect, it } from 'vitest';
import { editDistance, remember, similarity, suggest, type SearchQuery } from './similar';

const q = (query: string, usedAt: number, count = 1): SearchQuery => ({ query, usedAt, count });

describe('search history', () => {
  it('measures typos', () => {
    expect(editDistance('dance', 'danse')).toBe(1);
    expect(editDistance('rain', 'snow')).toBe(3);
  });

  it('starts with, contains, typos', () => {
    expect(similarity('Rain dance', 'rain')).toBe(3);
    expect(similarity('Rain dance', 'dance')).toBe(2);
    expect(similarity('Rain dance', 'rian')).toBe(1);
    expect(similarity('maria', 'ьфкш')).toBe(0); // раскладка не исправляется
    expect(similarity('snow', 'rain')).toBe(0);
  });

  it('suggests recent for an empty field and similar while typing', () => {
    const history = [q('rain', 1, 5), q('rain dance', 3), q('snow rain', 2)];
    expect(suggest(history, '').map((i) => i.query)).toEqual(['rain dance', 'snow rain', 'rain']);
    expect(suggest(history, 'rain').map((i) => i.query)).toEqual(['rain', 'rain dance', 'snow rain']);
  });

  it('raises a repeated query instead of adding it again', () => {
    const history = remember([q('a', 1), q('b', 2)], ' a ', 10);
    expect(history).toEqual([q('a', 10, 2), q('b', 2)]);
  });
});
