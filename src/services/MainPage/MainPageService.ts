import { Task } from 'fp-ts/Task';
import { TabList } from '../TabList';

export interface MainPageService {
  getTabLists(): Task<ReadonlyArray<TabList>>;
}
