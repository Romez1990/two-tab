import { Task } from 'fp-ts/Task';
import { TabListService, TabList } from '../TabList';
import { BrowserTabService } from '../BrowserTab';
import { MainPageService } from './MainPageService';

export class MainPageServiceImpl implements MainPageService {
  public constructor(
    private readonly tabListService: TabListService,
    private readonly browserTabService: BrowserTabService,
  ) {}

  public getTabLists = (): Task<ReadonlyArray<TabList>> => this.tabListService.getAll();
}
