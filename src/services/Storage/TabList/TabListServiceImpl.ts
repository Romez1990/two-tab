import { pipe } from 'fp-ts/function';
import { fold as foldB } from 'fp-ts/boolean';
import { map as mapA, filter, findIndex, unsafeDeleteAt } from 'fp-ts/ReadonlyArray';
import { ReadonlyNonEmptyArray, map as mapAN } from 'fp-ts/ReadonlyNonEmptyArray';
import { some, none, fold } from 'fp-ts/Option';
import { Task, map, chain } from 'fp-ts/Task';
import { TaskOption } from 'fp-ts-contrib/TaskOption';
import { DatetimeService } from '../../DataProcessing/Datetime';
import { TabListsUpdatingService, TabListsUpdateHandlers } from './Updating';
import { RepositoryFactory, Repository, Sort } from '../Storage';
import { checkNonEmpty } from '../../Utils/fp-ts/ReadonlyArray';
import { TabList, tabsLens } from './TabList';
import { TabListService } from './TabListService';
import { Tab, tabsAreEquals } from './Tab';
import { StoredTab } from './StoredTab';
import { StoredTabToCreate } from './StoredTabToCreate';
import { StoredTabList } from './StoredTabList';
import { StoredTabListToCreate } from './StoredTabListToCreate';
import { TabToCreate } from './TabToCreate';
import { TabNotFoundInTabListError } from './Errors';

export class TabListServiceImpl implements TabListService {
  public constructor(
    private readonly tabListsUpdatingService: TabListsUpdatingService,
    private readonly datetimeService: DatetimeService,
    repositoryFactory: RepositoryFactory,
  ) {
    this.tabRepository = repositoryFactory.create<StoredTab, StoredTabToCreate>('tabs', ['tabListId']);
    this.tabListRepository = repositoryFactory.create<StoredTabList, StoredTabListToCreate>('tabLists', ['createdAt']);
  }

  private readonly tabRepository: Repository<StoredTab, StoredTabToCreate>;
  private readonly tabListRepository: Repository<StoredTabList, StoredTabListToCreate>;

  public addUpdateHandlers(handlers: TabListsUpdateHandlers): void {
    this.tabListsUpdatingService.addHandlers(handlers);
  }

  public removeUpdateHandlers(): void {
    this.tabListsUpdatingService.removeHandlers();
  }

  public getAllTabLists = (): Task<ReadonlyArray<TabList>> =>
    pipe(
      this.tabRepository.getAll(),
      chain(storedTabs =>
        pipe(
          this.tabListRepository.getAll(Sort.by('createdAt').descending()),
          map(
            mapA(storedTabList =>
              pipe(
                storedTabs,
                filter(({ tabListId }) => tabListId === storedTabList.id),
                checkNonEmpty('tabs'),
                this.toTabs,
                tabs => this.toTabList(storedTabList, tabs),
              ),
            ),
          ),
          //
        ),
      ),
    );

  private toTabList = (storedTabList: StoredTabList, tabs: ReadonlyNonEmptyArray<Tab>): TabList => ({
    ...storedTabList,
    tabs,
  });

  private toTabs = (storedTabs: ReadonlyNonEmptyArray<StoredTab>): ReadonlyNonEmptyArray<Tab> =>
    pipe(
      storedTabs,
      mapAN(this.toTab),
      //
    );

  private toTab = ({ tabListId, ...tab }: StoredTab): Tab => tab;

  public addTabList = (listName: string, tabs: ReadonlyNonEmptyArray<TabToCreate>): Task<TabList> =>
    pipe(
      this.createTabList(listName),
      this.tabListRepository.save.bind(this.tabListRepository),
      chain(storedTabList =>
        pipe(
          tabs,
          mapAN(this.toStoredToCreate(storedTabList)),
          this.tabRepository.saveAll.bind(this.tabRepository),
          map(storedTabs => this.toTabList(storedTabList, storedTabs)),
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
