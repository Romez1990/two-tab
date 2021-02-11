import { IndexableType, Table } from 'dexie';
import { Task } from 'fp-ts/Task';

export interface StorageService {
  addTable(name: string, schema: string): void;
  getTable<T, TKey = IndexableType>(name: string): Task<Table<T, TKey>>;
}
