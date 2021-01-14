import Dexie, { Table, IndexableType } from 'dexie';
import { pipe, constant, constVoid } from 'fp-ts/function';
import { Task, map } from 'fp-ts/Task';
import { StorageService } from './StorageService';

const databaseName = 'tabs';

export class StorageServiceImpl extends Dexie implements StorageService {
  public constructor() {
    super(databaseName);
  }

  private readonly schemas = new Map<string, string>();

  public addTable(name: string, schema: string): void {
    this.schemas.set(name, schema);
  }

  public connect = (): Task<void> =>
    pipe(
      this.version(1).stores(Object.fromEntries(this.schemas.entries())),
      constant(this.open.bind(this)),
      map(constVoid),
    );

  public getTable = <T, TKey = IndexableType>(name: string): Table<T, TKey> => this.table(name);
}
