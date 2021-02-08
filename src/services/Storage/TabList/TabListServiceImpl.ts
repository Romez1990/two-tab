import { constant, pipe } from 'fp-ts/function';
import { sequenceT } from 'fp-ts/Apply';
import { findIndex, unsafeDeleteAt } from 'fp-ts/ReadonlyArray';
import { ReadonlyNonEmptyArray } from 'fp-ts/ReadonlyNonEmptyArray';
import { some, none, fold } from 'fp-ts/Option';
import { Task, task, map, chain } from 'fp-ts/Task';
import { TaskOption } from 'fp-ts-contrib/TaskOption';
import { DatetimeService } from '../../DataProcessing/Datetime';
import { TabListsUpdatingService, TabListsUpdateHandlers } from './Updating';
import { Sort } from '../Storage';
import { checkNonEmpty } from '../../Utils/fp-ts/ReadonlyArray';
import { TabList, fromTabListEntity, tabsLens } from './TabList';
import { TabListService } from './TabListService';
import { Tab, tabsAreEquals } from './Tab';
import { TabListEntityToCreate } from './TabListEntityToCreate';
import { TabToCreate } from './TabToCreate';
import { TabListRepository } from './TabListRepository';
import { TabNotFoundInTabListError } from './Errors';
import { TabListNormalizer } from './TabListNormalizer';
import { TabService } from './TabService';

export class TabListServiceImpl implements TabListService {
  public constructor(
    private readonly tabListRepository: TabListRepository,
    private readonly tabService: TabService,
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

  public getAll = (): Task<ReadonlyArray<TabList>> =>
    pipe(
      sequenceT(task)(this.tabListRepository.getAll(Sort.by('createdAt').descending()), this.tabService.getAll()),
      map(([tabListEntities, tabEntities]) => this.tabListNormalizer.denormalize(tabListEntities, tabEntities)),
    );

  public add = (listName: string, tabs: ReadonlyNonEmptyArray<TabToCreate>): Task<TabList> =>
    pipe(
      this.createTabList(listName),
      this.tabListRepository.save.bind(this.tabListRepository),
      chain(tabListEntity =>
        pipe(
          this.tabService.addAll(tabListEntity, tabs),
          map(fromTabListEntity(tabListEntity)),
          //
        ),
      ),
      map(tabList => {
        this.tabListsUpdatingService.addTabList(tabList);
        return tabList;
      }),
    );

  private createTabList = (name: string): TabListEntityToCreate => ({
    name,
    createdAt: this.datetimeService.getCurrent(),
  });

  public delete = (tabList: TabList): Task<void> =>
    pipe(
      tabList.tabs,
      this.tabService.deleteAll.bind(this.tabService),
      chain(() => this.tabListRepository.delete(tabList)),
      map(() => this.tabListsUpdatingService.deleteTabList(tabList)),
    );

  public deleteTab = (tabList: TabList, tab: Tab): TaskOption<TabList> =>
    pipe(
      this.isLastTab(tabList)
        ? pipe(this.delete(tabList), map(constant(none)))
        : pipe(this.deleteTabAndUpdateTabList(tabList, tab), map(some)),
    );

  private isLastTab = ({ tabs }: TabList): boolean => tabs.length === 1;

  private deleteTabAndUpdateTabList = (tabList: TabList, tab: Tab): Task<TabList> =>
    pipe(
      this.tabService.delete(tab),
      map(() => this.deleteTabFromTabList(tab, tabList)),
      map(newTabList => {
        this.tabListsUpdatingService.updateTabList(newTabList);
        return newTabList;
      }),
    );

  private deleteTabFromTabList = (tab: Tab, tabList: TabList): TabList => {
    const { tabs } = tabList;
    return pipe(
      tabs,
      findIndex(tabsAreEquals(tab)),
      fold(
        () => new TabNotFoundInTabListError(tabList).throw(),
        index => unsafeDeleteAt(index, tabs),
      ),
      checkNonEmpty('tabs'),
      newTabs => tabsLens.set(newTabs)(tabList),
    );
  };
}
