import { ReadonlyNonEmptyArray } from 'fp-ts/ReadonlyNonEmptyArray';
import { Task } from 'fp-ts/Task';
import { BrowserTab } from './BrowserTab';
import { BrowserWindow } from './BrowserWindow';
import { TabOpenProperties } from './TabOpenProperties';
import { TabUpdateProperties } from './TabUpdateProperties';
import { WindowOpenProperties } from './WindowOpenProperties';

export interface BrowserTabInteractions {
  getTabsInCurrentWindow(): Task<ReadonlyNonEmptyArray<BrowserTab>>;
  getWindows(): Task<ReadonlyNonEmptyArray<BrowserWindow>>;
  openTab(properties: TabOpenProperties): Task<BrowserTab>;
  updateTab(tab: BrowserTab, properties: TabUpdateProperties): Task<BrowserTab>;
  closeTabs(tabs: ReadonlyNonEmptyArray<BrowserTab>): Task<void>;
  openWindow(properties: WindowOpenProperties): Task<BrowserWindow>;
  isNewTab(tab: BrowserTab): boolean;
}
