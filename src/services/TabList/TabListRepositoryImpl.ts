import { Table } from 'dexie';
import { pipe } from 'fp-ts/function';
import { findIndex, unsafeDeleteAt, isNonEmpty } from 'fp-ts/ReadonlyArray';
import { ReadonlyNonEmptyArray } from 'fp-ts/ReadonlyNonEmptyArray';
import { Option, fromNullable, some, none, map as mapO, getOrElseW } from 'fp-ts/Option';
import { Task, map } from 'fp-ts/Task';
import { TaskOption } from 'fp-ts-contrib/TaskOption';
import { StorageService } from '../Storage';
import { TabListIdUndefinedError, TabNotFoundInTabListError } from './Errors';
import { TabListRepository } from './TabListRepository';
import { TabList, idLens, tabsLens } from './TabList';
import { Tab } from './Tab';

export class TabListRepositoryImpl implements TabListRepository {
  public constructor(private readonly storage: StorageService) {
    storage.addTable(this.tableName, '++id, data');
  }

  private readonly tableName = 'tabLists';

  private get table(): Table<TabList, number> {
    return this.storage.getTable(this.tableName);
  }

  public getAllTabLists = (): Task<ReadonlyArray<TabList>> => () => this.table.reverse().sortBy('key');

  public saveTabList = (tabList: TabList): Task<TabList> =>
    pipe(
      () => this.table.add(tabList),
      map(id => idLens.set(id)(tabList)),
    );

  public removeTabList = (tabList: TabList): Task<void> => () =>
    pipe(this.getTabListId(tabList), id => this.table.delete(id));

  public removeTab = (tabList: TabList, tab: Tab): TaskOption<TabList> =>
    pipe(
      this.findTabList(tabList),
      map(foundTabList =>
        pipe(
          this.removeTabFromArray(tab, foundTabList.tabs),
          getOrElseW(() => new TabNotFoundInTabListError(tabList).throw()),
          this.modifyTabsInTabList(foundTabList),
        ),
      ),
    );

  private findTabList = (tabList: TabList): Task<TabList> =>
    pipe(
      this.getTabListId(tabList),
      id => () => this.table.get(id),
      map(fromNullable),
      map(getOrElseW(() => new TabNotFoundInTabListError(tabList).throw())),
    );

  private removeTabFromArray = ({ id }: Tab, tabs: ReadonlyNonEmptyArray<Tab>): Option<ReadonlyArray<Tab>> =>
    pipe(
      tabs,
      findIndex(tab => tab.id === id),
      mapO(index => unsafeDeleteAt(index, tabs)),
    );

  private modifyTabsInTabList = (tabList: TabList) => (tabs: ReadonlyArray<Tab>): Option<TabList> =>
    pipe(
      isNonEmpty(tabs) ? some(tabs) : none,
      mapO(nonEmptyTabs => tabsLens.set(nonEmptyTabs)(tabList)),
    );

  private getTabListId(tabList: TabList): number {
    const { id } = tabList;
    if (typeof id === 'undefined') {
      throw new TabListIdUndefinedError(tabList);
    }
    return id;
  }
}
