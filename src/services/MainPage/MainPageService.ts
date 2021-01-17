import { Task } from 'fp-ts/Task';
import { TaskOption } from 'fp-ts-contrib/TaskOption';
import { TabList, Tab } from '../TabList';

export interface MainPageService {
  getTabLists(): Task<ReadonlyArray<TabList>>;
  openTabList(tabList: TabList): Task<void>;
  openTabListInNewWindow(tabList: TabList, focused: boolean): Task<void>;
  removeTabList(tabList: TabList): Task<void>;
  removeTab(tabList: TabList, tab: Tab): TaskOption<TabList>;
}
