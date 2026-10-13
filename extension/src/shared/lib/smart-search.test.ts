import { describe, expect, it } from 'vitest';
import { SearchSyntaxError, matches, parseQuery, relevance } from './smart-search';

const term = (text: string, field = 'name', phrase = false) => ({ op: 'term', field, text, phrase });

describe('parseQuery', () => {
  it('reads words, or, not, phrases, groups and prefixes', () => {
    expect(parseQuery('rain dance')).toEqual({ op: 'and', items: [term('rain'), term('dance')] });
    expect(parseQuery('rain | snow')).toEqual({ op: 'or', items: [term('rain'), term('snow')] });
    expect(parseQuery('rain -remix')).toEqual({ op: 'and', items: [term('rain'), { op: 'not', item: term('remix') }] });
    expect(parseQuery('"rain dance"')).toEqual(term('rain dance', 'name', true));
    expect(parseQuery('(rain | snow) dance')).toEqual({
      op: 'and',
      items: [{ op: 'or', items: [term('rain'), term('snow')] }, term('dance')],
    });
    expect(parseQuery('path:"R lang T" rain')).toEqual({ op: 'and', items: [term('R lang T', 'path', true), term('rain')] });
    expect(parseQuery('url:tiktok')).toEqual(term('tiktok', 'url'));
    expect(parseQuery('pre-roll')).toEqual(term('pre-roll'));
    expect(parseQuery('   ')).toBeNull();
  });

  it.each(['(rain', 'rain)', '"rain', 'rain |', '-', 'path:', '| a'])('refuses %s', (query) => {
    expect(() => parseQuery(query)).toThrow(SearchSyntaxError);
  });
});

describe('matches', () => {
  const doc = { name: 'Ёлка Rain Dance', url: 'https://tiktok.com/@maria', path: 'R lang T/Мария' };

  it('ignores case, ё and the keyboard layout', () => {
    expect(matches(parseQuery('елка danc')!, doc)).toBe(true);
    expect(matches(parseQuery('url:ьфкшф')!, doc)).toBe(true);
    expect(matches(parseQuery('path:vfhbz')!, doc)).toBe(true);
    expect(matches(parseQuery('rain -dance')!, doc)).toBe(false);
    expect(matches(parseQuery('path:x')!, { name: 'x' })).toBe(false);
  });

  it('ranks a phrase in the name and a name starting with the word higher', () => {
    const query = parseQuery('"rain dance" | elka')!;
    expect(relevance(query, { name: 'Rain dance' })).toBeGreaterThan(relevance(query, { name: 'x elka' }));
    expect(relevance(parseQuery('rain')!, { name: 'Rain x' })).toBeGreaterThan(relevance(parseQuery('rain')!, { name: 'x rain' }));
  });
});
