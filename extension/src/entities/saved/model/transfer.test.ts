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

describe('экспорт и импорт сохранённых', () => {
  it('экспорт читается обратно без потерь', () => {
    expect(parseExport(JSON.stringify(toExport([item], 5)))).toEqual([item]);
  });

  it('чужой файл, другая версия и испорченная запись не импортируются', () => {
    expect(() => parseExport('не json')).toThrow('Это не файл JSON');
    expect(() => parseExport('{"items":[]}')).toThrow('Это не файл экспорта Tabsurd');
    expect(() => parseExport(JSON.stringify({ ...toExport([]), version: 2 }))).toThrow('Неизвестная версия');
    const broken = { ...item, window: { ...item.window, tabs: [{ ...item.window.tabs[0]!, group: 3 }] } };
    expect(() => parseExport(JSON.stringify(toExport([item, broken])))).toThrow('Запись 2 испорчена');
  });

  it('имя файла с датой', () => {
    expect(exportFileName(new Date(2026, 9, 3).getTime())).toBe('tabsurd-saved-2026-10-03.json');
  });
});
