import { ReadonlyNonEmptyArray } from 'fp-ts/ReadonlyNonEmptyArray';
import { Repository } from './Repository';
import { WithId } from './WithId';

export interface RepositoryFactory {
  create<T extends TToCreate & WithId, TToCreate>(
    tableName: string,
    indexes?: ReadonlyNonEmptyArray<keyof TToCreate>,
  ): Repository<T, TToCreate>;
}
