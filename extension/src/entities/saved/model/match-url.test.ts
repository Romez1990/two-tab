import { describe, expect, it } from 'vitest';
import { findMatches, pageKey } from './match-url';
import type { SavedItem } from './types';

function item(id: string, urls: string[], title = ''): SavedItem {
  return {
    id,
    kind: 'group',
    title,
    savedAt: 1,
    reason: 'manual',
    window: { tabs: urls.map((url) => ({ url, title: `t ${url}` })), groups: [{ title, color: 'blue' }] },
  } as unknown as SavedItem;
}

describe('findMatches', () => {
  it('ignores the part after #', () => {
    expect(pageKey('https://a.com/x#y')).toBe('https://a.com/x');
    expect(findMatches([item('1', ['https://a.com/x#top'])], 'https://a.com/x').map((m) => m.id)).toEqual(['1']);
  });

  it('returns every item with the address and skips others', () => {
    const items = [item('1', ['https://a.com/']), item('2', ['https://b.com/']), item('3', ['https://b.com/', 'https://a.com/'], 'G')];
    const found = findMatches(items, 'https://a.com/');
    expect(found.map((m) => m.id)).toEqual(['1', '3']);
    expect(found[1]).toMatchObject({ title: 'G', color: 'blue', tabs: 2 });
  });

  it('uses the first tab title for an item without a title', () => {
    expect(findMatches([item('1', ['https://a.com/'])], 'https://a.com/')[0]!.title).toBe('t https://a.com/');
  });

  it('never matches extension pages', () => {
    expect(findMatches([item('1', ['chrome://newtab/'])], 'chrome://newtab/')).toEqual([]);
  });
});
