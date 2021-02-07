import { pipe, constant } from 'fp-ts/function';
import { Task, chain } from 'fp-ts/Task';
import { TaskOption } from 'fp-ts-contrib/TaskOption';
import { TabListService, TabList, Tab, TabListsUpdateHandlers } from '../../../Storage/TabList';
import { BrowserTabService } from '../../../Browser/BrowserTab';
import { TabListSPageService } from './TabListSPageService';

export class TabListsPageServiceImpl implements TabListSPageService {
  public constructor(
    private readonly tabListService: TabListService,
    private readonly browserTabService: BrowserTabService,
  ) {}

  public addUpdateHandlers(handlers: TabListsUpdateHandlers): void {
    this.tabListService.addUpdateHandlers(handlers);
  }

  public removeUpdateHandlers(): void {
    this.tabListService.removeUpdateHandlers();
  }

  public getTabLists = (): Task<ReadonlyArray<TabList>> => this.tabListService.getAll();

  public openTabList = (tabList: TabList): Task<void> =>
    pipe(
      this.browserTabService.openTabList(tabList),
      chain(constant(this.tabListService.delete(tabList))),
      //
    );

  public openTabListInNewWindow = (tabList: TabList, focused: boolean): Task<void> =>
    pipe(
      this.browserTabService.openTabListInNewWindow(tabList, focused),
      chain(constant(this.tabListService.delete(tabList))),
    );

  public deleteTabList = (tabList: TabList): Task<void> => this.tabListService.delete(tabList);

  public deleteTab = (tabList: TabList, tab: Tab): TaskOption<TabList> => this.tabListService.deleteTab(tabList, tab);
}
