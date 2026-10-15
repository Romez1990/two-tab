import Dexie, { type EntityTable } from 'dexie';

interface Meta {
  key: string;
  value: unknown;
}

/**
 * Table records are described in the entities (entities/snapshot, entities/closed-tab); only the storage schema is here,
 * so that shared does not depend on the domain.
 */
export interface StoredRecord {
  id?: number;
  [field: string]: unknown;
}

/** Extension database in IndexedDB. */
class TabsurdDb extends Dexie {
  meta!: EntityTable<Meta, 'key'>;
  /** Window snapshot history; the current snapshot is in `meta` under the `currentSnapshot` key. */
  snapshots!: EntityTable<StoredRecord & { takenAt: number }, 'id'>;
  closedTabs!: EntityTable<StoredRecord & { closedAt: number }, 'id'>;
  saved!: EntityTable<{ id: string; savedAt: number; [field: string]: unknown }, 'id'>;
  /** Page checks by address: when last loaded and what was received. */
  pageChecks!: EntityTable<{ url: string; at: number; [field: string]: unknown }, 'url'>;

  constructor() {
    super('tabsurd');
    this.version(1).stores({ meta: 'key' });
    this.version(2).stores({ snapshots: '++id, takenAt', closedTabs: '++id, closedAt' });
    this.version(3).stores({ saved: 'id, savedAt' });
    this.version(4).stores({ pageChecks: 'url' });
  }
}

export const db = new TabsurdDb();
