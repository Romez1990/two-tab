import { describe, expect, it } from 'vitest';
import { moveSavedTab, removeSavedTab } from './edit-tabs';
import type { SavedItem } from './types';

const item = (urls: string[]): SavedItem => ({
  id: 'x',
  kind: 'group',
  title: '',
  savedAt: 0,
  reason: 'manual',
  window: {
    uid: '',
    focused: false,
    state: 'normal',
    groups: [],
    tabs: urls.map((url) => ({ url, title: '', pinned: false, active: false, group: -1 })),
  },
});
const urls = (i: SavedItem | undefined) => i?.window.tabs.map((t) => t.url);

describe('правка вкладок сохранённого', () => {
  it('перетаскивание вниз и вверх', () => {
    expect(urls(moveSavedTab(item(['a', 'b', 'c']), 0, 2))).toEqual(['b', 'c', 'a']);
    expect(urls(moveSavedTab(item(['a', 'b', 'c']), 2, 0))).toEqual(['c', 'a', 'b']);
  });

  it('удаление вкладки, последняя — удаляет запись', () => {
    expect(urls(removeSavedTab(item(['a', 'b']), 0))).toEqual(['b']);
    expect(removeSavedTab(item(['a']), 0)).toBeUndefined();
  });
});
