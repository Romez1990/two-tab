import { ReadonlyNonEmptyArray } from 'fp-ts/ReadonlyNonEmptyArray';
import { Task } from 'fp-ts/Task';
import { Sort } from './Sort';
import { WithId } from './WithId';

export interface Repository<T extends WithId & TToCreate, TToCreate> {
  save(object: TToCreate): Task<T>;
  saveAll(objects: ReadonlyNonEmptyArray<TToCreate>): Task<ReadonlyNonEmptyArray<T>>;
  getAll(sort?: Sort): Task<ReadonlyArray<T>>;
  getAllById(ids: ReadonlyNonEmptyArray<number>): Task<ReadonlyNonEmptyArray<T>>;
  delete(object: T): Task<void>;
  deleteAll(objects: ReadonlyNonEmptyArray<T>): Task<void>;
}
