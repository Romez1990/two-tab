import { ReadonlyNonEmptyArray } from 'fp-ts/ReadonlyNonEmptyArray';
import { Task } from 'fp-ts/Task';
import { BrowserTab, BrowserWindow, OpenProperties, OpenInNewWindowProperties } from './BrowserTab';

export interface BrowserTabService {
  getTabsInCurrentWindow(all: boolean): Task<ReadonlyArray<BrowserTab>>;
  getWindows(): Task<ReadonlyArray<BrowserWindow>>;
  open(openProperties: OpenProperties): Task<BrowserTab>;
  openInNewWindow(openInNewWindowProperties: OpenInNewWindowProperties): Task<BrowserWindow>;
  close(tabs: ReadonlyNonEmptyArray<BrowserTab>): Task<void>;
}
