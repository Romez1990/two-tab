import Dexie, { Table, IndexableType } from 'dexie';
import { pipe } from 'fp-ts/function';
import { Task, map } from 'fp-ts/Task';
import { StorageService } from './StorageService';
import { StorageState, StorageStateFactory } from './StorageState';

const DATABASE_NAME = 'tabs';

export class StorageServiceImpl implements StorageService {
  public constructor(private readonly storageStateFactory: StorageStateFactory) {
    this.dexie = new Dexie(DATABASE_NAME);
    this.state = this.storageStateFactory.createUnconnectedStorage(this.dexie);
  }

  private readonly dexie: Dexie;
  private state: StorageState;

  public addTable = (name: string, schema: string): void => this.state.addTable(name, schema);

  private isUnconnected = true;

  public getTable<T, TKey = IndexableType>(name: string): Task<Table<T, TKey>> {
    if (!this.isUnconnected) return this.state.getTable<T, TKey>(name);
    this.isUnconnected = false;
    return this.connectAndGetTable(name);
  }

  private connectAndGetTable<T, TKey = IndexableType>(name: string): Task<Table<T, TKey>> {
    const connectingTask = this.state.getTable<T, TKey>(name);
    this.state = this.storageStateFactory.createConnectingStorage(this.dexie, connectingTask);
    return pipe(
      connectingTask,
      map(table => {
        this.state = this.storageStateFactory.createUnconnectedStorage(this.dexie);
        return table;
      }),
    );
  }
}
