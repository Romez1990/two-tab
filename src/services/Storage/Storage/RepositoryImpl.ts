import { pipe } from 'fp-ts/function';
import { map as mapA, toArray } from 'fp-ts/ReadonlyArray';
import { ReadonlyNonEmptyArray, map as mapAN, concat, zipWith } from 'fp-ts/ReadonlyNonEmptyArray';
import { Task, map } from 'fp-ts/Task';
import { Table } from 'dexie';
import { Lens } from 'monocle-ts';
import { Repository } from './Repository';
import { WithId } from './WithId';
import { StorageService } from './StorageService';
import { checkNonEmpty, join } from '../../Utils/fp-ts/ReadonlyArray';
import { Sort } from './Sort';
import { Direction } from './Direction';

export class RepositoryImpl<T extends TToCreate & WithId, TToCreate> implements Repository<T, TToCreate> {
  public constructor(
    private readonly storage: StorageService,
    private readonly tableName: string,
    indexes?: ReadonlyNonEmptyArray<keyof TToCreate>,
  ) {
    storage.addTable(this.tableName, this.getSchema(indexes));
  }

  private getSchema = (indexes?: ReadonlyNonEmptyArray<keyof TToCreate>): string =>
    pipe(
      ['++id'] as ReadonlyNonEmptyArray<string>,
      defaultSchema =>
        typeof indexes === 'undefined'
          ? defaultSchema
          : concat(defaultSchema, indexes as ReadonlyNonEmptyArray<string>),
      join(','),
    );

  private get table(): Table<T, number> {
    return this.storage.getTable(this.tableName);
  }

  private readonly idLens = Lens.fromProp<T>()('id');

  public save = (object: TToCreate): Task<T> =>
    pipe(
      () => this.table.add(object as T),
      map(this.setObjectId(object)),
      //
    );

  public saveAll = (objects: ReadonlyNonEmptyArray<TToCreate>): Task<ReadonlyNonEmptyArray<T>> =>
    pipe(
      () => this.table.bulkAdd(objects as ReadonlyNonEmptyArray<T>, { allKeys: true }),
      map(ids =>
        pipe(
          checkNonEmpty<number>('ids')(ids as ReadonlyArray<number>),
          nonEmptyIds => zipWith(nonEmptyIds, objects, (id, object) => this.setObjectId(object)(id)),
          //
        ),
      ),
    );

  private setObjectId = (object: TToCreate) => (id: number): T => this.idLens.set(id)(object as T);

  public getAll = (sort?: Sort): Task<ReadonlyArray<T>> => () => {
    if (typeof sort === 'undefined') {
      return this.table.toArray();
    }
    const { fieldName, direction } = sort;
    return direction === Direction.Asc
      ? this.table.toCollection().sortBy(fieldName)
      : this.table.reverse().sortBy(fieldName);
  };

  public getAllById = (ids: ReadonlyNonEmptyArray<number>): Task<ReadonlyNonEmptyArray<T>> =>
    pipe(
      () => this.table.bulkGet(toArray(ids)),
      map(
        mapA(object => {
          if (typeof object === 'undefined') {
            throw new Error();
          }
          return object;
        }),
      ),
      map(checkNonEmpty('objects')),
    );

  public delete = ({ id }: T): Task<void> => () => this.table.delete(id);

  public deleteAll = (objects: ReadonlyNonEmptyArray<T>): Task<void> =>
    pipe(
      objects,
      mapAN(this.idLens.get),
      ids => () => this.table.bulkDelete(ids),
      //
    );
}
