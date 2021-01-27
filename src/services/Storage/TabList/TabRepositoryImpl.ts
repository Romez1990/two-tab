import { RepositoryImpl } from '../Storage/RepositoryImpl';
import { StoredTab } from './StoredTab';
import { StoredTabToCreate } from './StoredTabToCreate';
import { TabRepository } from './TabRepository';
import { StorageService } from '../Storage';

export class TabRepositoryImpl extends RepositoryImpl<StoredTab, StoredTabToCreate> implements TabRepository {
  public constructor(storage: StorageService) {
    super(storage, 'tabs', ['tabListId']);
  }
}
