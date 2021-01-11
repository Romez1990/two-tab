import { Task } from 'fp-ts/Task';
import { BrowserTab, BrowserWindow } from './BrowserTab';

export interface BrowserTabService {
  getTabsInCurrentWindow(all: boolean): Task<ReadonlyArray<BrowserTab>>;
  getWindows(): Task<ReadonlyArray<BrowserWindow>>;
  close(tabs: ReadonlyArray<BrowserTab>): Task<void>;
}