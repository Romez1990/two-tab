import { Task } from 'fp-ts/Task';
import { Tab, BrowserWindow } from './BrowserTab';

export interface TabService {
  getTabsInCurrentWindow(all: boolean): Task<ReadonlyArray<Tab>>;
  getWindows(): Task<ReadonlyArray<BrowserWindow>>;
  close(tabs: ReadonlyArray<Tab>): Task<void>;
}
