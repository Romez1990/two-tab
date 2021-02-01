import { TabListSPageService, StubTabListSPageService } from '../../Components/App/TabLists';
import { ServiceContainer } from './ServiceContainer';

export class StubServiceContainer implements ServiceContainer {
  public constructor() {
    this.tabListsPageService = new StubTabListSPageService();
  }

  public readonly tabListsPageService: TabListSPageService;
}
