import { Task } from 'fp-ts/Task';
import { TabList } from './TabList';

export interface TabListService {
  getAll(): Task<ReadonlyArray<TabList>>;
  save(tabList: TabList): Task<TabList>;
}
