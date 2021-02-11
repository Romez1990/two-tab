import Dexie from 'dexie';
import { Task } from 'fp-ts/Task';
import { StorageState } from './StorageState';
import { StorageStateFactory } from './StorageStateFactory';
import { UnconnectedStorage } from './UnconnectedStorage';
import { ConnectingStorage } from './ConnectingStorage';
import { ConnectedStorage } from './ConnectedStorage';

export class StorageStateFactoryImpl implements StorageStateFactory {
  public createUnconnectedStorage(dexie: Dexie): StorageState {
    return new UnconnectedStorage(dexie);
  }

  public createConnectingStorage(dexie: Dexie, connectingTask: Task<unknown>): StorageState {
    return new ConnectingStorage(dexie, connectingTask);
  }

  public createConnectedStorage(dexie: Dexie): StorageState {
    return new ConnectedStorage(dexie);
  }
}
