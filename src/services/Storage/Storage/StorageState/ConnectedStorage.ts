import Dexie, { IndexableType, Table } from 'dexie';
import { Task, of } from 'fp-ts/Task';
import { StorageState } from './StorageState';
import { Schema } from './Schema';

export class ConnectedStorage implements StorageState {
  public constructor(private readonly dexie: Dexie) {}

  public addTable(): void {
    throw new Error('Not implemented');
  }

  public getTable = <T, TKey = IndexableType>(name: string): Task<Table<T, TKey>> => of(this.dexie.table(name));
}
