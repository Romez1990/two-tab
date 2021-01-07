import { Task } from 'fp-ts/Task';
import { Tab } from './Tab';

export interface TabService {
  getTabsInCurrentWindow(all: boolean): Task<ReadonlyArray<Tab>>;
}
