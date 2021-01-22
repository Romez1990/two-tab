import { pipe } from 'fp-ts/function';
import { ReadonlyNonEmptyArray } from 'fp-ts/ReadonlyNonEmptyArray';
import { some, none } from 'fp-ts/Option';
import { Task, map, of } from 'fp-ts/Task';
import { TaskOption, fold } from 'fp-ts-contrib/TaskOption';
import { DatetimeService } from '../Datetime';
import { TabListsUpdatingService, TabListsUpdateHandlers } from './Updating';
import { TabList } from './TabList';
import { TabListService } from './TabListService';
import { TabListRepository } from './TabListRepository';
import { Tab } from './Tab';

export class TabListServiceImpl implements TabListService {
  public constructor(
    private readonly tabListRepository: TabListRepository,
    private readonly tabListsUpdatingService: TabListsUpdatingService,
    private readonly datetimeService: DatetimeService,
  ) {}

  public addUpdateHandlers(handlers: TabListsUpdateHandlers): void {
    this.tabListsUpdatingService.addHandlers(handlers);
  }

  public removeUpdateHandlers(): void {
    this.tabListsUpdatingService.removeHandlers();
  }

  public getAllTabLists = (): Task<ReadonlyArray<TabList>> => this.tabListRepository.getAllTabLists();

  public addTabList = (listName: string, tabs: ReadonlyNonEmptyArray<Tab>): Task<TabList> =>
    pipe(
      this.createTabList(listName, tabs),
      this.tabListRepository.addTabList.bind(this.tabListRepository),
      map(tabList => {
        this.tabListsUpdatingService.addTabList(tabList);
        return tabList;
      }),
    );

  private createTabList = (name: string, tabs: ReadonlyNonEmptyArray<Tab>): TabList => ({
    name,
    createdAt: this.datetimeService.getCurrent(),
    tabs,
  });

  public deleteTabList = (tabList: TabList): Task<void> =>
    pipe(
      this.tabListRepository.deleteTabList(tabList),
      map(() => this.tabListsUpdatingService.deleteTabList(tabList)),
    );

  public deleteTab = (tabList: TabList, tab: Tab): TaskOption<TabList> =>
    pipe(
      this.tabListRepository.deleteTab(tabList, tab),
      fold(
        () => {
          this.tabListsUpdatingService.deleteTabList(tabList);
          return of(none);
        },
        newTabList => {
          this.tabListsUpdatingService.updateTabList(newTabList);
          return of(some(newTabList));
        },
      ),
    );
}
