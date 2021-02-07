import { RepositoryImpl } from '../Storage/RepositoryImpl';
import { TabListEntity } from './TabListEntity';
import { TabListEntityToCreate } from './TabListEntityToCreate';
import { TabListRepository } from './TabListRepository';
import { StorageService } from '../Storage';

export class TabListRepositoryImpl
  extends RepositoryImpl<TabListEntity, TabListEntityToCreate>
  implements TabListRepository {
  public constructor(storage: StorageService) {
    super(storage, 'tabLists', ['createdAt']);
  }
}
