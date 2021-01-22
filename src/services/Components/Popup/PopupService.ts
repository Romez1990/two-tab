import { Task } from 'fp-ts/Task';
import { ReadonlyNonEmptyArray } from 'fp-ts/ReadonlyNonEmptyArray';
import { BrowserTab, BrowserWindow } from '../../Browser/BrowserTab';

export interface PopupService {
  openApp(): Task<void>;
  getTabsInCurrentWindow(all: boolean): Task<ReadonlyArray<BrowserTab>>;
  getWindows(): Task<ReadonlyArray<BrowserWindow>>;
  saveTabs(listName: string, tabs: ReadonlyNonEmptyArray<BrowserTab>): Task<void>;
}
