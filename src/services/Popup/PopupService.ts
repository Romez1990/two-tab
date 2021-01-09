import { Task } from 'fp-ts/Task';
import { Tab, BrowserWindow } from '../Tab';

export interface PopupService {
  readonly appUrl: string;
  getTabsInCurrentWindow(all: boolean): Task<ReadonlyArray<Tab>>;
  getWindows(): Task<ReadonlyArray<BrowserWindow>>;
  saveTabs(tabs: ReadonlyArray<Tab>): Task<void>;
}
