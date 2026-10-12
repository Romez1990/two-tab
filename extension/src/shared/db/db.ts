import Dexie, { type EntityTable } from 'dexie';

interface Meta {
  key: string;
  value: unknown;
}

/**
 * Записи таблиц описаны в сущностях (entities/snapshot, entities/closed-tab); здесь — только схема хранения,
 * чтобы shared не зависел от предметной области.
 */
export interface StoredRecord {
  id?: number;
  [field: string]: unknown;
}

/** База расширения в IndexedDB. Таблицы сохранённых окон и групп добавятся на этапе 3. */
class TabsurdDb extends Dexie {
  meta!: EntityTable<Meta, 'key'>;
  /** История снимков окон; текущий снимок — в `meta` под ключом `currentSnapshot`. */
  snapshots!: EntityTable<StoredRecord & { takenAt: number }, 'id'>;
  closedTabs!: EntityTable<StoredRecord & { closedAt: number }, 'id'>;

  constructor() {
    super('tabsurd');
    this.version(1).stores({ meta: 'key' });
    this.version(2).stores({ snapshots: '++id, takenAt', closedTabs: '++id, closedAt' });
  }
}

export const db = new TabsurdDb();
