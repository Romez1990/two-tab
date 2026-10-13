import { parseBetterOneTab, parseSupaTabs } from './import-other';
import type { SavedItem } from './types';

/** Файл экспорта «Сохранённых» (docs/extension/pages/saved.md, раздел 1). */
export interface SavedExport {
  format: typeof FORMAT;
  version: typeof VERSION;
  exportedAt: number;
  items: SavedItem[];
}

const FORMAT = 'tabsurd-saved';
const VERSION = 1;

export function toExport(items: readonly SavedItem[], now = Date.now()): SavedExport {
  return { format: FORMAT, version: VERSION, exportedAt: now, items: [...items] };
}

export function exportFileName(now = Date.now()): string {
  const d = new Date(now);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `tabsurd-saved-${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}.json`;
}

/**
 * Разбирает файл импорта: экспорт Tabsurd, BetterOneTab или SupaTabs — формат определяется сам.
 * Чужой формат или испорченная запись — ошибка, и ничего не импортируется.
 */
export function parseExport(text: string): SavedItem[] {
  let data: unknown;
  try {
    data = JSON.parse(text.replace(/^﻿/, ''));
  } catch {
    throw new Error('Это не файл JSON');
  }
  if (!isObject(data) || data.format !== FORMAT) {
    const items = parseBetterOneTab(data) ?? parseSupaTabs(data);
    if (items) return items;
    throw new Error('Это не файл экспорта Tabsurd, BetterOneTab или SupaTabs');
  }
  if (data.version !== VERSION) throw new Error(`Неизвестная версия формата: ${String(data.version)}`);
  if (!Array.isArray(data.items)) throw new Error('В файле нет списка записей');
  return data.items.map((item, i) => {
    if (!isSavedItem(item)) throw new Error(`Запись ${i + 1} испорчена`);
    return item;
  });
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function isSavedItem(v: unknown): v is SavedItem {
  if (!isObject(v) || !isObject(v.window)) return false;
  const w = v.window;
  return (
    typeof v.id === 'string' &&
    (v.kind === 'window' || v.kind === 'group') &&
    typeof v.title === 'string' &&
    typeof v.savedAt === 'number' &&
    (v.reason === 'manual' || v.reason === 'auto') &&
    typeof w.uid === 'string' &&
    Array.isArray(w.groups) &&
    w.groups.every((g) => isObject(g) && typeof g.title === 'string' && typeof g.color === 'string') &&
    Array.isArray(w.tabs) &&
    w.tabs.every(
      (t) =>
        isObject(t) &&
        typeof t.url === 'string' &&
        typeof t.title === 'string' &&
        typeof t.group === 'number' &&
        t.group < (w.groups as unknown[]).length,
    )
  );
}
