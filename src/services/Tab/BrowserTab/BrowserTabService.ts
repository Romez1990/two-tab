import { Task } from 'fp-ts/Task';
import { Tab } from './Tab';
import { BrowserWindow } from './BrowserWindow';
import { OpenProperties } from './OpenProperties';

export interface BrowserTabService {
  getTabsInCurrentWindow(): Task<ReadonlyArray<Tab>>;
  getWindows(): Task<ReadonlyArray<BrowserWindow>>;
  open(tab: OpenProperties): Task<Tab>;
  close(tabs: ReadonlyArray<Tab>): Task<void>;
}
