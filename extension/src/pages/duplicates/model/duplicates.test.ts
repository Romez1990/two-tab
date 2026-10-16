import { describe, expect, it } from 'vitest';
import type { SavedItem } from '@/entities/saved';
import { duplicateKey, findDuplicates, placeOf } from './duplicates';

function saved(id: string, title: string, urls: string[]): SavedItem {
  return {
    id,
    kind: 'group',
    title,
    savedAt: 1,
    reason: 'manual',
    window: {
      uid: id,
      focused: false,
      state: 'normal',
      tabs: urls.map((url) => ({ url, title: url, pinned: false, active: false, group: 0 })),
      groups: [{ title, color: 'blue', collapsed: false }],
    },
  };
}

describe('duplicates', () => {
  it('compares pages like page_key', () => {
    expect(duplicateKey('http://www.Site.com/a/?utm_source=x&from=y#top')).toBe(duplicateKey('https://site.com/a'));
    expect(duplicateKey('https://site.com/a?id=1')).not.toBe(duplicateKey('https://site.com/a?id=2'));
    expect(duplicateKey('chrome://newtab/')).toBeUndefined();
  });

  it('joins open and saved tabs, two copies in one group too, most repeated first', () => {
    const open = [
      { id: 1, windowId: 10, title: 'A', url: 'https://a.com/' },
      { id: 2, windowId: 20, title: 'A', url: 'https://www.a.com' },
      { id: 3, windowId: 20, title: 'B', url: 'https://b.com/' },
    ];
    const found = findDuplicates(open, [
      saved('s', 'Музыка', ['https://a.com/#x', 'https://b.com', 'https://b.com/?utm_x=1']),
    ]);
    expect(found.map((d) => [d.key, d.copies.length])).toEqual([
      ['a.com', 3],
      ['b.com', 3],
    ]);
    expect(found[0]!.copies.map(placeOf)).toEqual(['Открыта, окно 1', 'Открыта, окно 2', 'Сохранена, группа «Музыка»']);
  });
});
