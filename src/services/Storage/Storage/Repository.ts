import { ReadonlyNonEmptyArray } from 'fp-ts/ReadonlyNonEmptyArray';
import { Task } from 'fp-ts/Task';
import { Sort } from './Sort';
import { WithId } from './WithId';

export interface Repository<T extends WithId & TToCreate, TToCreate> {
  save(entity: TToCreate): Task<T>;
  saveAll(entities: ReadonlyNonEmptyArray<TToCreate>): Task<ReadonlyNonEmptyArray<T>>;
  getAll(sort?: Sort): Task<ReadonlyArray<T>>;
  getAllById(ids: ReadonlyNonEmptyArray<number>): Task<ReadonlyNonEmptyArray<T>>;
  delete(entity: T): Task<void>;
  deleteAll(entities: ReadonlyNonEmptyArray<T>): Task<void>;
  deleteAllById(ids: ReadonlyNonEmptyArray<number>): Task<void>;
}
