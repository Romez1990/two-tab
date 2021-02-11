import Dexie, { Table, IndexableType } from 'dexie';
import { constant, constVoid, pipe } from 'fp-ts/function';
import { Task, map } from 'fp-ts/Task';
import { StorageState } from './StorageState';
import { Schema } from './Schema';

export class UnconnectedStorage implements StorageState {
  public constructor(private readonly dexie: Dexie) {}

  private readonly schemas = new Map<string, string>();

  public addTable(name: string, schema: string): void {
    this.schemas.set(name, schema);
  }

  public getTable = <T, TKey = IndexableType>(name: string): Task<Table<T, TKey>> =>
    pipe(
      this.connect(),
      map(() => this.dexie.table(name)),
    );

  private connect = (): Task<void> =>
    pipe(
      this.getSelectedSchema(),
      selectedSchema => this.dexie.version(1).stores(selectedSchema),
      constant(this.dexie.open.bind(this.dexie)),
      map(constVoid),
    );

  private getSelectedSchema = (): Schema => Object.fromEntries(this.schemas.entries());
}
