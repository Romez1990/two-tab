import { TabListSPageService, StubTabListSPageService } from '../../Components/App/TabLists';
import { ServiceContainer } from './ServiceContainer';
import { FakeStorageService, StorageService } from '../../Storage/Storage';

export class StubServiceContainer implements ServiceContainer {
  public constructor() {
    this.storageService = new FakeStorageService();

    this.tabListsPageService = new StubTabListSPageService();
  }

  public readonly tabListsPageService: TabListSPageService;

  public readonly storageService: StorageService;
}
