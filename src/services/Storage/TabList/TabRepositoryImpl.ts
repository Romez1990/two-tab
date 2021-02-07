import { RepositoryImpl } from '../Storage/RepositoryImpl';
import { TabEntity } from './TabEntity';
import { TabEntityToCreate } from './TabEntityToCreate';
import { TabRepository } from './TabRepository';
import { StorageService } from '../Storage';

export class TabRepositoryImpl extends RepositoryImpl<TabEntity, TabEntityToCreate> implements TabRepository {
  public constructor(storage: StorageService) {
    super(storage, 'tabs', ['tabListId']);
  }
}
