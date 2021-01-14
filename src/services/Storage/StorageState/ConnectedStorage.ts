import { map, Task } from 'fp-ts/Task';
import Dexie, { IndexableType, Table } from 'dexie';
import { pipe, constant, constVoid } from 'fp-ts/function';
import { StorageState } from './StorageState';
import { Schema } from './Schema';

const databaseName = 'tabs';

export class ConnectedStorage extends Dexie implements StorageState {
  public constructor(private readonly schema: Schema) {
    super(databaseName);
  }

  public addTable(): void {
    throw new Error('Not implemented');
  }

  public getSchema(): Schema {
    throw new Error('Not implemented');
  }

  public connect = (): Task<void> =>
    pipe(this.version(1).stores(this.schema), constant(this.open.bind(this)), map(constVoid));

  public getTable = <T, TKey = IndexableType>(name: string): Table<T, TKey> => this.table(name);
}
