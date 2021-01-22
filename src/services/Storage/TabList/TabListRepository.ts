import { Task } from 'fp-ts/Task';
import { TaskOption } from 'fp-ts-contrib/TaskOption';
import { TabList } from './TabList';
import { Tab } from './Tab';

export interface TabListRepository {
  getAllTabLists(): Task<ReadonlyArray<TabList>>;
  addTabList(tabList: TabList): Task<TabList>;
  deleteTabList(tabList: TabList): Task<void>;
  deleteTab(tabList: TabList, tab: Tab): TaskOption<TabList>;
}
