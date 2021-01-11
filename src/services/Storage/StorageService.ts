import { Task } from 'fp-ts/Task';
import { IndexableType, Table } from 'dexie';

export interface StorageService {
  addTable(name: string, schema: string): void;
  connect(): Task<void>;
  getTable<T, TKey = IndexableType>(name: string): Table<T, TKey>;
}
