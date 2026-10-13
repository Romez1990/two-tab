import type { SnapshotWindow } from '@/entities/snapshot/@x/saved';

/**
 * Сохранённое окно или группа (docs/extension/pages/saved.md, раздел 1). Группа хранится как окно,
 * все вкладки которого в одной группе.
 */
export interface SavedItem {
  id: string;
  kind: 'window' | 'group';
  title: string;
  savedAt: number;
  /** `auto` — закрыто автозакрытием (раздел 2.5). */
  reason: 'manual' | 'auto';
  window: SnapshotWindow;
}
