import Dexie, { type EntityTable } from 'dexie';

interface Meta {
  key: string;
  value: unknown;
}

/** База расширения в IndexedDB. Таблицы окон, снимков и сохранённых групп добавятся на этапах 2–3. */
class TabsurdDb extends Dexie {
  meta!: EntityTable<Meta, 'key'>;

  constructor() {
    super('tabsurd');
    this.version(1).stores({ meta: 'key' });
  }
}

export const db = new TabsurdDb();
