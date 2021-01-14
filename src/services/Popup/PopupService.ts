import { Task } from 'fp-ts/Task';
import { ReadonlyNonEmptyArray } from 'fp-ts/ReadonlyNonEmptyArray';
import { BrowserTab, BrowserWindow } from '../BrowserTab';

export interface PopupService {
  readonly appUrl: string;
  getTabsInCurrentWindow(all: boolean): Task<ReadonlyArray<BrowserTab>>;
  getWindows(): Task<ReadonlyArray<BrowserWindow>>;
  saveTabs(listName: string, tabs: ReadonlyNonEmptyArray<BrowserTab>): Task<void>;
}
