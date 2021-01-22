import { ReadonlyNonEmptyArray } from 'fp-ts/ReadonlyNonEmptyArray';
import { Task } from 'fp-ts/Task';
import { TabList } from '../TabList';
import { BrowserTab, BrowserWindow, TabOpenProperties, TabUpdateProperties } from './BrowserTab';

export interface BrowserTabService {
  getTabsInCurrentWindow(all: boolean): Task<ReadonlyArray<BrowserTab>>;
  getWindows(): Task<ReadonlyArray<BrowserWindow>>;
  openTabList(tabList: TabList): Task<void>;
  openTabListInNewWindow(tabList: TabList, focused: boolean): Task<void>;
  openTab(properties: TabOpenProperties): Task<BrowserTab>;
  updateTab(tab: BrowserTab, properties: TabUpdateProperties): Task<BrowserTab>;
  close(tabs: ReadonlyNonEmptyArray<BrowserTab>): Task<void>;
  isNewTab(tab: BrowserTab): boolean;
  isExtensionTab(tab: BrowserTab): boolean;
}
