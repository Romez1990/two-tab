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

  public saveTabList = (listName: string, tabs: ReadonlyNonEmptyArray<Tab>): Task<TabList> =>
    pipe(
      this.createTabList(listName, tabs),
      this.tabListRepository.saveTabList.bind(this.tabListRepository),
      //
    );

  private createTabList = (name: string, tabs: ReadonlyNonEmptyArray<Tab>): TabList => ({
    name,
    date: this.datetimeService.getCurrent(),
    tabs,
  });

  public removeTabList = (tabList: TabList): Task<void> => this.tabListRepository.removeTabList(tabList);

  public removeTab = (tabList: TabList, tab: Tab): TaskOption<TabList> =>
    this.tabListRepository.removeTab(tabList, tab);
}
