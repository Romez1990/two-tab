import { Schema } from './Schema';
import { StorageState } from './StorageState';
import { StorageStateFactory } from './StorageStateFactory';
import { UnconnectedStorage } from './UnconnectedStorage';
import { ConnectedStorage } from './ConnectedStorage';

export class StorageStateFactoryImpl implements StorageStateFactory {
  public createUnconnectedStorage(): StorageState {
    return new UnconnectedStorage();
  }

  public createConnectedStorage(schema: Schema): StorageState {
    return new ConnectedStorage(schema);
  }
}
