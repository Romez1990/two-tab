import { ReadonlyNonEmptyArray } from 'fp-ts/ReadonlyNonEmptyArray';
import { Task } from 'fp-ts/Task';
import { TabList } from './TabList';
import { Tab } from './Tab';

export interface TabListService {
  getAllTabLists(): Task<ReadonlyArray<TabList>>;
  saveTabList(listName: string, tabs: ReadonlyNonEmptyArray<Tab>): Task<TabList>;
  removeTab(tab: Tab): Task<void>;
  removeTabList(tabList: TabList): Task<void>;
}
