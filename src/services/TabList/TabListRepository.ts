import { Task } from 'fp-ts/Task';
import { TaskOption } from 'fp-ts-contrib/TaskOption';
import { TabList } from './TabList';
import { Tab } from './Tab';

export interface TabListRepository {
  getAllTabLists(): Task<ReadonlyArray<TabList>>;
  saveTabList(tabList: TabList): Task<TabList>;
  removeTabList(tabList: TabList): Task<void>;
  removeTab(tabList: TabList, tab: Tab): TaskOption<TabList>;
}
