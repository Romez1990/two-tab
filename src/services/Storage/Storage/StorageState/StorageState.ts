import { Task } from 'fp-ts/Task';
import { IndexableType, Table } from 'dexie';

export interface StorageState {
  addTable(name: string, schema: string): void;
  getTable<T, TKey = IndexableType>(name: string): Task<Table<T, TKey>>;
}
