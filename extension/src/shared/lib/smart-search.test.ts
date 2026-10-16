import { describe, expect, it } from 'vitest';
import { SearchSyntaxError, matches, mentionedSources, parseQuery, relevance, type SearchDoc } from './smart-search';

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
    expect(parseQuery('path:"R lang T" rain')).toEqual({
      op: 'and',
      items: [term('R lang T', 'path', true), term('rain')],
    });
    expect(parseQuery('url:tiktok')).toEqual(term('tiktok', 'url'));
    expect(parseQuery('Song:Ankha name:x')).toEqual({ op: 'and', items: [term('Ankha', 'song'), term('x')] });
    expect(parseQuery('pre-roll')).toEqual(term('pre-roll'));
    expect(parseQuery('"12:30"')).toEqual(term('12:30', 'name', true));
    expect(parseQuery('   ')).toBeNull();
  });

  it('applies a prefix before brackets to the words of the group without their own', () => {
    expect(parseQuery('any:(cat | path:kitty)')).toEqual({
      op: 'or',
      items: [term('cat', 'any'), term('kitty', 'path')],
    });
    expect(parseQuery('-source:(open | saved)')).toEqual({
      op: 'not',
      item: {
        op: 'or',
        items: [
          { op: 'source', source: 'open' },
          { op: 'source', source: 'saved' },
        ],
      },
    });
  });

  it.each(['(rain', 'rain)', '"rain', 'rain |', '-', 'path:', '| a', 'chanel:x', '12:30', 'source:arch', 'зфер:x'])(
    'refuses %s',
    (query) => {
      expect(() => parseQuery(query)).toThrow(SearchSyntaxError);
    },
  );

  it('names the known prefixes and sources in the errors', () => {
    expect(() => parseQuery('chanel:x')).toThrow(/channel:/);
    expect(() => parseQuery('source:arch')).toThrow(/archive/);
  });
});

describe('matches', () => {
  const doc: SearchDoc = { source: 'saved', name: 'Ёлка Rain Dance', url: 'https://tiktok.com/@maria', group: 'Мария' };

  it('ignores case and ё but not the keyboard layout', () => {
    expect(matches(parseQuery('елка danc')!, doc)).toBe(true);
    expect(matches(parseQuery('url:maria')!, doc)).toBe(true);
    expect(matches(parseQuery('url:ьфкшф')!, doc)).toBe(false);
    expect(matches(parseQuery('rain -dance')!, doc)).toBe(false);
  });

  it('is strict: a field the source does not have never matches, and under not always does', () => {
    expect(matches(parseQuery('path:x')!, doc)).toBe(false);
    expect(matches(parseQuery('-channel:x')!, doc)).toBe(true);
    expect(matches(parseQuery('-channel:x source:archive')!, doc)).toBe(false);
    expect(matches(parseQuery('channel:x | url:tiktok')!, doc)).toBe(true);
  });

  it('searches any field with any:, and the source with source:', () => {
    expect(matches(parseQuery('any:мария')!, doc)).toBe(true);
    expect(matches(parseQuery('group:мария')!, doc)).toBe(true);
    expect(matches(parseQuery('мария')!, doc)).toBe(false);
    expect(matches(parseQuery('source:saved')!, doc)).toBe(true);
    expect(matches(parseQuery('-source:saved')!, doc)).toBe(false);
  });

  it('lists the sources the query mentions', () => {
    expect(mentionedSources(parseQuery('a source:closed | -source:(closed | open)')!)).toEqual(['closed', 'open']);
  });

  it('ranks a phrase in the name and a name starting with the word higher', () => {
    const query = parseQuery('"rain dance" | elka')!;
    expect(relevance(query, { name: 'Rain dance' })).toBeGreaterThan(relevance(query, { name: 'x elka' }));
    expect(relevance(parseQuery('rain')!, { name: 'Rain x' })).toBeGreaterThan(
      relevance(parseQuery('rain')!, { name: 'x rain' }),
    );
  });
});
