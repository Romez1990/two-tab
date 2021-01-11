import { Task } from 'fp-ts/Task';
import { BrowserTab, BrowserWindow } from '../BrowserTab';

export interface PopupService {
  readonly appUrl: string;
  getTabsInCurrentWindow(all: boolean): Task<ReadonlyArray<BrowserTab>>;
  getWindows(): Task<ReadonlyArray<BrowserWindow>>;
  saveTabs(tabs: ReadonlyArray<BrowserTab>): Task<void>;
}
