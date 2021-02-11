import { pipe } from 'fp-ts/function';
import { map as mapA, toArray } from 'fp-ts/ReadonlyArray';
import { ReadonlyNonEmptyArray, map as mapAN, concat, zipWith } from 'fp-ts/ReadonlyNonEmptyArray';
import { Task, map, chain } from 'fp-ts/Task';
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

  private get table(): Task<Table<T, number>> {
    return this.storage.getTable(this.tableName);
  }

  private readonly idLens = Lens.fromProp<T>()('id');

  public save = (entity: TToCreate): Task<T> =>
    pipe(
      this.table,
      chain(table => () => table.add(entity as T)),
      map(this.setEntityId(entity)),
      //
    );

  public saveAll = (entities: ReadonlyNonEmptyArray<TToCreate>): Task<ReadonlyNonEmptyArray<T>> =>
    pipe(
      this.table,
      chain(table => () => table.bulkAdd(entities as ReadonlyNonEmptyArray<T>, { allKeys: true })),
      map(ids =>
        pipe(
          checkNonEmpty<number>('ids')(ids as ReadonlyArray<number>),
          nonEmptyIds => zipWith(nonEmptyIds, entities, (id, entity) => this.setEntityId(entity)(id)),
          //
        ),
      ),
    );

  private setEntityId = (entity: TToCreate) => (id: number): T => this.idLens.set(id)(entity as T);

  public getAll = (sort?: Sort): Task<ReadonlyArray<T>> =>
    pipe(
      this.table,
      chain(table => () => {
        if (typeof sort === 'undefined') {
          return table.toArray();
        }
        const { fieldName, direction } = sort;
        return direction === Direction.Asc ? table.toCollection().sortBy(fieldName) : table.reverse().sortBy(fieldName);
      }),
    );

  public getAllById = (ids: ReadonlyNonEmptyArray<number>): Task<ReadonlyNonEmptyArray<T>> =>
    pipe(
      this.table,
      chain(table => () => table.bulkGet(toArray(ids))),
      map(
        mapA(entity => {
          if (typeof entity === 'undefined') {
            throw new Error();
          }
          return entity;
        }),
      ),
      map(checkNonEmpty('entities')),
    );

  public delete = ({ id }: T): Task<void> =>
    pipe(
      this.table,
      chain(table => () => table.delete(id)),
    );

  public deleteAll = (entities: ReadonlyNonEmptyArray<T>): Task<void> =>
    pipe(
      entities,
      mapAN(this.idLens.get),
      this.deleteAllById.bind(this),
      //
    );

  public deleteAllById = (ids: ReadonlyNonEmptyArray<number>): Task<void> =>
    pipe(
      this.table,
      chain(table => () => table.bulkDelete(ids)),
    );
}
