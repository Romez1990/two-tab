import { Task } from 'fp-ts/Task';
import { Tab } from '../Tab';

export interface BrowserTabService {
  getTabsInCurrentWindow(): Task<ReadonlyArray<Tab>>;
}
