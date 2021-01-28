import { pipe } from 'fp-ts/function';
import { sequenceT } from 'fp-ts/Apply';
import { fold as foldB } from 'fp-ts/boolean';
import { findIndex, unsafeDeleteAt } from 'fp-ts/ReadonlyArray';
import { ReadonlyNonEmptyArray, map as mapAN } from 'fp-ts/ReadonlyNonEmptyArray';
import { some, none, fold } from 'fp-ts/Option';
import { Task, task, map, chain } from 'fp-ts/Task';
import { TaskOption } from 'fp-ts-contrib/TaskOption';
import { DatetimeService } from '../../DataProcessing/Datetime';
import { TabListsUpdatingService, TabListsUpdateHandlers } from './Updating';
import { Sort } from '../Storage';
import { checkNonEmpty } from '../../Utils/fp-ts/ReadonlyArray';
import { TabList, tabsLens } from './TabList';
import { TabListService } from './TabListService';
import { Tab, tabsAreEquals } from './Tab';
import { StoredTab } from './StoredTab';
import { StoredTabToCreate } from './StoredTabToCreate';
import { StoredTabList, toTabList } from './StoredTabList';
import { StoredTabListToCreate } from './StoredTabListToCreate';
import { TabToCreate } from './TabToCreate';
import { TabRepository } from './TabRepository';
import { TabListRepository } from './TabListRepository';
import { TabNotFoundInTabListError } from './Errors';
import { TabListNormalizer } from './TabListNormalizer';

export class TabListServiceImpl implements TabListService {
  public constructor(
    private readonly tabListRepository: TabListRepository,
    private readonly tabRepository: TabRepository,
    private readonly tabListNormalizer: TabListNormalizer,
    private readonly tabListsUpdatingService: TabListsUpdatingService,
    private readonly datetimeService: DatetimeService,
  ) {}

  public addUpdateHandlers(handlers: TabListsUpdateHandlers): void {
    this.tabListsUpdatingService.addHandlers(handlers);
  }

  public removeUpdateHandlers(): void {
    this.tabListsUpdatingService.removeHandlers();
  }

  public getAllTabLists = (): Task<ReadonlyArray<TabList>> =>
    pipe(
      sequenceT(task)(this.tabListRepository.getAll(Sort.by('createdAt').descending()), this.tabRepository.getAll()),
      map(([storedTabLists, storedTabs]) => this.tabListNormalizer.denormalize(storedTabLists, storedTabs)),
    );

  public addTabList = (listName: string, tabs: ReadonlyNonEmptyArray<TabToCreate>): Task<TabList> =>
    pipe(
      this.createTabList(listName),
      this.tabListRepository.save.bind(this.tabListRepository),
      chain(storedTabList =>
        pipe(
          tabs,
          mapAN(this.toStoredToCreate(storedTabList)),
          this.tabRepository.saveAll.bind(this.tabRepository),
          map(toTabList(storedTabList)),
        ),
      ),
      map(tabList => {
        this.tabListsUpdatingService.addTabList(tabList);
        return tabList;
      }),
    );

  private toStoredToCreate = ({ id }: StoredTabList) => (tab: TabToCreate): StoredTabToCreate => ({
    ...tab,
    tabListId: id,
  });

  private createTabList = (name: string): StoredTabListToCreate => ({
    name,
    createdAt: this.datetimeService.getCurrent(),
  });

  public deleteTabList = (tabList: TabList): Task<void> =>
    pipe(
      tabList.tabs,
      mapAN(this.toStoredTab(tabList)),
      this.tabRepository.deleteAll.bind(this.tabRepository),
      chain(() => this.tabListRepository.delete(tabList)),
      map(() => this.tabListsUpdatingService.deleteTabList(tabList)),
    );

  private toStoredTab = ({ id }: TabList) => (tab: Tab): StoredTab => ({
    ...tab,
    tabListId: id,
  });

  public deleteTab = (tabList: TabList, tab: Tab): TaskOption<TabList> =>
    pipe(
      tab,
      this.toStoredTab(tabList),
      this.tabRepository.delete.bind(this.tabRepository),
      map(() =>
        pipe(
          tabList.tabs.length === 1,
          foldB(
            () => {
              this.tabListsUpdatingService.deleteTabList(tabList);
              return none;
            },
            () => {
              const newTabList = pipe(
                this.deleteTabFromArray(tab, tabList),
                newTabs => tabsLens.set(newTabs)(tabList),
                //
              );
              this.tabListsUpdatingService.updateTabList(newTabList);
              return some(newTabList);
            },
          ),
        ),
      ),
    );

  private deleteTabFromArray = (tab: Tab, tabList: TabList): ReadonlyNonEmptyArray<Tab> => {
    const { tabs } = tabList;
    return pipe(
      tabs,
      findIndex(tabsAreEquals(tab)),
      fold(
        () => new TabNotFoundInTabListError(tabList).throw(),
        index => unsafeDeleteAt(index, tabs),
      ),
      checkNonEmpty('tabs'),
    );
  };
}
