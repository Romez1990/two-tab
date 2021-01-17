import { pipe, constant } from 'fp-ts/function';
import { Task, chain } from 'fp-ts/Task';
import { TaskOption } from 'fp-ts-contrib/TaskOption';
import { TabListService, TabList, Tab } from '../TabList';
import { BrowserTabService } from '../BrowserTab';
import { MainPageService } from './MainPageService';

export class MainPageServiceImpl implements MainPageService {
  public constructor(
    private readonly tabListService: TabListService,
    private readonly browserTabService: BrowserTabService,
  ) {}

  public getTabLists = (): Task<ReadonlyArray<TabList>> => this.tabListService.getAllTabLists();

  public openTabList = (tabList: TabList): Task<void> =>
    pipe(this.browserTabService.openTabList(tabList), chain(constant(this.tabListService.removeTabList(tabList))));

  public openTabListInNewWindow = (tabList: TabList, focused: boolean): Task<void> =>
    pipe(
      this.browserTabService.openTabListInNewWindow(tabList, focused),
      chain(constant(this.tabListService.removeTabList(tabList))),
    );

  public removeTabList = (tabList: TabList): Task<void> => this.tabListService.removeTabList(tabList);

  public removeTab = (tabList: TabList, tab: Tab): TaskOption<TabList> => this.tabListService.removeTab(tabList, tab);
}
