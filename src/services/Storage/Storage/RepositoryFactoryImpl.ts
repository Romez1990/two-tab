import { ReadonlyNonEmptyArray } from 'fp-ts/ReadonlyNonEmptyArray';
import { WithId } from './WithId';
import { Repository } from './Repository';
import { RepositoryFactory } from './RepositoryFactory';
import { RepositoryImpl } from './RepositoryImpl';
import { StorageService } from './StorageService';

export class RepositoryFactoryImpl implements RepositoryFactory {
  public constructor(private readonly storage: StorageService) {}

  public create = <T extends TToCreate & WithId, TToCreate>(
    tableName: string,
    indexes?: ReadonlyNonEmptyArray<keyof TToCreate>,
  ): Repository<T, TToCreate> => new RepositoryImpl(this.storage, tableName, indexes);
}
