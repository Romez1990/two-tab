import { Task } from 'fp-ts/Task';
import { TabList } from './TabList';

export interface TabListRepository {
  getAll(): Task<ReadonlyArray<TabList>>;
  save(tabList: TabList): Task<TabList>;
}
