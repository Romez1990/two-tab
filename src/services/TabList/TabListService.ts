import { ReadonlyNonEmptyArray } from 'fp-ts/ReadonlyNonEmptyArray';
import { Task } from 'fp-ts/Task';
import { TaskOption } from 'fp-ts-contrib/TaskOption';
import { TabList } from './TabList';
import { Tab } from './Tab';

export interface TabListService {
  getAllTabLists(): Task<ReadonlyArray<TabList>>;
  saveTabList(listName: string, tabs: ReadonlyNonEmptyArray<Tab>): Task<TabList>;
  deleteTabList(tabList: TabList): Task<void>;
  deleteTab(tabList: TabList, tab: Tab): TaskOption<TabList>;
}
