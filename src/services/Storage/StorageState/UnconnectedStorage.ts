import { Task } from 'fp-ts/Task';
import { Table, IndexableType } from 'dexie';
import { StorageState } from './StorageState';
import { Schema } from './Schema';

export class UnconnectedStorage implements StorageState {
  private readonly schemas = new Map<string, string>();

  public addTable(name: string, schema: string): void {
    this.schemas.set(name, schema);
  }

  public getSchema = (): Schema => Object.fromEntries(this.schemas.entries());

  public connect(): Task<void> {
    throw new Error('Not implemented');
  }

  public getTable<T, TKey = IndexableType>(): Table<T, TKey> {
    throw new Error('Not implemented');
  }
}
