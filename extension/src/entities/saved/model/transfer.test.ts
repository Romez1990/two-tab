import { describe, expect, it } from 'vitest';
import { exportFileName, parseExport, toExport } from './transfer';
import type { SavedItem } from './types';

const item: SavedItem = {
  id: 'a',
  kind: 'group',
  title: 'Работа',
  savedAt: 1,
  reason: 'manual',
  window: {
    uid: 'w',
    focused: false,
    state: 'normal',
    groups: [{ title: 'Работа', color: 'blue', collapsed: false }],
    tabs: [{ url: 'https://example.com/', title: 'Пример', pinned: false, active: true, group: 0 }],
  },
};

describe('export and import of saved items', () => {
  it('reads an export back without losses', () => {
    expect(parseExport(JSON.stringify(toExport([item], 5)))).toEqual([item]);
  });

  it('rejects a foreign file, another version and a broken record', () => {
    expect(() => parseExport('не json')).toThrow('Это не файл JSON');
    expect(() => parseExport('{"items":[]}')).toThrow('Это не файл экспорта Tabsurd, BetterOneTab или SupaTabs');
    expect(() => parseExport(JSON.stringify({ ...toExport([]), version: 2 }))).toThrow('Неизвестная версия');
    const broken = { ...item, window: { ...item.window, tabs: [{ ...item.window.tabs[0]!, group: 3 }] } };
    expect(() => parseExport(JSON.stringify(toExport([item, broken])))).toThrow('Запись 2 испорчена');
  });

  it('names the file with the date', () => {
    expect(exportFileName(new Date(2026, 9, 3).getTime())).toBe('tabsurd-saved-2026-10-03.json');
  });
});

describe('import from BetterOneTab and SupaTabs', () => {
  it('BetterOneTab: name from the file or empty, time from the file, no color, empty tabs skipped', () => {
    const file =
      '﻿' +
      JSON.stringify([
        {
          title: 'Музыка',
          time: 100,
          tabs: [
            { url: 'https://a/', title: 'A' },
            { url: 'chrome://newtab/', title: 'New Tab' },
          ],
        },
        { title: '', time: 200, tabs: [{ url: 'https://b/', title: 'B' }] },
        { title: 'Пустая', time: 300, tabs: [{ url: 'chrome://newtab/', title: '' }] },
      ]);
    const items = parseExport(file);
    expect(items.map((i) => [i.title, i.savedAt, i.window.tabs.map((t) => t.url), i.window.groups])).toEqual([
      ['Музыка', 100, ['https://a/'], [{ title: 'Музыка', color: '', collapsed: false }]],
      ['', 200, ['https://b/'], [{ title: '', color: '', collapsed: false }]],
    ]);
  });

  it('gives the same record ids on a repeated import and different ids to different groups', () => {
    const file = JSON.stringify([
      { title: '', time: 1, tabs: [{ url: 'https://a/', title: '' }] },
      { title: '', time: 2, tabs: [{ url: 'https://a/', title: '' }] },
    ]);
    const ids = parseExport(file).map((i) => i.id);
    expect(parseExport(file).map((i) => i.id)).toEqual(ids);
    expect(new Set(ids).size).toBe(2);
  });

  it('SupaTabs: groups in workspace order, tabs by tabIds, no color', () => {
    const file = JSON.stringify({
      groups: {
        g2: { title: '', date: 20, color: 'green', tabIds: ['t2'] },
        g1: { title: 'Первая', date: 10, tabIds: ['t1', 't3'] },
      },
      tabs: {
        t1: { url: 'https://1/', title: '1' },
        t2: { url: 'https://2/', title: '2' },
        t3: { url: 'chrome://newtab/', title: '' },
      },
      workspaces: { w: { groupOrder: ['g1', 'g2'] } },
    });
    expect(
      parseExport(file).map((i) => [i.title, i.savedAt, i.window.tabs.map((t) => t.url), i.window.groups[0]?.color]),
    ).toEqual([
      ['Первая', 10, ['https://1/'], ''],
      ['', 20, ['https://2/'], ''],
    ]);
  });
});
