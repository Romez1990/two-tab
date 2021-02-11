import Dexie from 'dexie';
import { StorageState } from './StorageState';
import { Task } from 'fp-ts/Task';

export interface StorageStateFactory {
  createUnconnectedStorage(dexie: Dexie): StorageState;
  createConnectingStorage(dexie: Dexie, connectingTask: Task<unknown>): StorageState;
  createConnectedStorage(dexie: Dexie): StorageState;
}
