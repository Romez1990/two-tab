import { Task } from 'fp-ts/Task';
import { TaskOption } from 'fp-ts-contrib/TaskOption';
import { TabList, Tab, TabListsUpdateHandlers } from '../TabList';

export interface MainPageService {
  addUpdateHandlers(handlers: TabListsUpdateHandlers): void;
  removeUpdateHandlers(): void;
  getTabLists(): Task<ReadonlyArray<TabList>>;
  openTabList(tabList: TabList): Task<void>;
  openTabListInNewWindow(tabList: TabList, focused: boolean): Task<void>;
  deleteTabList(tabList: TabList): Task<void>;
  deleteTab(tabList: TabList, tab: Tab): TaskOption<TabList>;
}
