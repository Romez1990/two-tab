import { of, Task } from 'fp-ts/Task';
import { IndexableType, Table } from 'dexie';
import { StorageService } from './StorageService';
import { NotImplementedError } from '../../Infrastructure/Error';

export class FakeStorageService implements StorageService {
  public addTable(): void {
    throw new NotImplementedError();
  }

  public connect = (): Task<void> => of(undefined);

  public getTable<T, TKey = IndexableType>(): Table<T, TKey> {
    throw new NotImplementedError();
  }
}
