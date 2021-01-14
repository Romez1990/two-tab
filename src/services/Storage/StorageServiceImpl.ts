import { Table, IndexableType } from 'dexie';
import { Task } from 'fp-ts/Task';
import { StorageAlreadyConnectedError } from './Errors';
import { StorageService } from './StorageService';
import { StorageState, StorageStateFactory } from './StorageState';

export class StorageServiceImpl implements StorageService {
  public constructor(private readonly storageStateFactory: StorageStateFactory) {
    this.state = this.storageStateFactory.createUnconnectedStorage();
  }

  private state: StorageState;
  private isConnected = false;

  public addTable = (name: string, schema: string): void => this.state.addTable(name, schema);

  public connect(): Task<void> {
    if (this.isConnected) {
      throw new StorageAlreadyConnectedError();
    }
    const { schema } = this.state;
    this.state = this.storageStateFactory.createConnectedStorage(schema);
    return this.state.connect();
  }

  public getTable = <T, TKey = IndexableType>(name: string): Table<T, TKey> => this.state.getTable(name);
}
