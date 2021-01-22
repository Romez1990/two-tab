import { StorageState } from './StorageState';
import { Schema } from './Schema';

export interface StorageStateFactory {
  createUnconnectedStorage(): StorageState;
  createConnectedStorage(schema: Schema): StorageState;
}
