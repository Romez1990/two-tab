import Dexie, { Table, IndexableType } from 'dexie';
import { pipe } from 'fp-ts/function';
import { Task, map } from 'fp-ts/Task';
import { StorageState } from './StorageState';

export class ConnectingStorage implements StorageState {
  public constructor(private readonly dexie: Dexie, private readonly connectingTask: Task<unknown>) {}

  public addTable(): void {
    throw new Error('Not implemented');
  }

  public getTable = <T, TKey = IndexableType>(name: string): Task<Table<T, TKey>> =>
    pipe(
      this.connectingTask,
      map(() => this.dexie.table(name)),
    );
}
