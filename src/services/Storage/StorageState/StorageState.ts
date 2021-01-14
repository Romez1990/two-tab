import { Task } from 'fp-ts/Task';
import { IndexableType, Table } from 'dexie';
import { Schema } from './Schema';

export interface StorageState {
  addTable(name: string, schema: string): void;
  getSchema(): Schema;
  connect(): Task<void>;
  getTable<T, TKey = IndexableType>(name: string): Table<T, TKey>;
}
