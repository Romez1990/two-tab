import { Task } from 'fp-ts/Task';
import { TabList } from './TabList';

export interface TabListRepository {
  getAllTabLists(): Task<ReadonlyArray<TabList>>;
  saveTabList(tabList: TabList): Task<TabList>;
}
