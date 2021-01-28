import { RepositoryImpl } from '../Storage/RepositoryImpl';
import { StoredTabList } from './StoredTabList';
import { StoredTabListToCreate } from './StoredTabListToCreate';
import { TabListRepository } from './TabListRepository';
import { StorageService } from '../Storage';

export class TabListRepositoryImpl
  extends RepositoryImpl<StoredTabList, StoredTabListToCreate>
  implements TabListRepository {
  public constructor(storage: StorageService) {
    super(storage, 'tabLists', ['createdAt']);
  }
}
