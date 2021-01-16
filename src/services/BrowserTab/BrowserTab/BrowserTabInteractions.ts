import { ReadonlyNonEmptyArray } from 'fp-ts/ReadonlyNonEmptyArray';
import { Task } from 'fp-ts/Task';
import { BrowserTab } from './BrowserTab';
import { BrowserWindow } from './BrowserWindow';
import { TabOpenProperties } from './TabOpenProperties';
import { WindowOpenProperties } from './WindowOpenProperties';

export interface BrowserTabInteractions {
  getTabsInCurrentWindow(): Task<ReadonlyNonEmptyArray<BrowserTab>>;
  getWindows(): Task<ReadonlyNonEmptyArray<BrowserWindow>>;
  openTab(properties: TabOpenProperties): Task<BrowserTab>;
  openWindow(properties: WindowOpenProperties): Task<BrowserWindow>;
  closeTabs(tabs: ReadonlyNonEmptyArray<BrowserTab>): Task<void>;
}
