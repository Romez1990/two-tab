import { pipe } from 'fp-ts/function';
import { ReadonlyNonEmptyArray } from 'fp-ts/ReadonlyNonEmptyArray';
import { Task } from 'fp-ts/Task';
import { TaskOption } from 'fp-ts-contrib/TaskOption';
import { DatetimeService } from '../Datetime';
import { TabList } from './TabList';
import { TabListService } from './TabListService';
import { TabListRepository } from './TabListRepository';
import { Tab } from './Tab';

export class TabListServiceImpl implements TabListService {
  public constructor(
    private readonly tabListRepository: TabListRepository,
    private readonly datetimeService: DatetimeService,
  ) {}

  public getAllTabLists = (): Task<ReadonlyArray<TabList>> => this.tabListRepository.getAllTabLists();

  public addTabList = (listName: string, tabs: ReadonlyNonEmptyArray<Tab>): Task<TabList> =>
    pipe(
      this.createTabList(listName, tabs),
      this.tabListRepository.addTabList.bind(this.tabListRepository),
      //
    );

  private createTabList = (name: string, tabs: ReadonlyNonEmptyArray<Tab>): TabList => ({
    name,
    createdAt: this.datetimeService.getCurrent(),
    tabs,
  });

  public deleteTabList = (tabList: TabList): Task<void> => this.tabListRepository.deleteTabList(tabList);

  public deleteTab = (tabList: TabList, tab: Tab): TaskOption<TabList> =>
    this.tabListRepository.deleteTab(tabList, tab);
}
