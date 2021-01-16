import { ReadonlyNonEmptyArray } from 'fp-ts/ReadonlyNonEmptyArray';
import { Task } from 'fp-ts/Task';
import { TabList, Tab } from '../TabList';
import { BrowserTab, BrowserWindow } from './BrowserTab';

export interface BrowserTabService {
  getTabsInCurrentWindow(all: boolean): Task<ReadonlyArray<BrowserTab>>;
  getWindows(): Task<ReadonlyArray<BrowserWindow>>;
  openTabList(tabList: TabList): Task<void>;
  openTabListInNewWindow(tabList: TabList, focused: boolean): Task<void>;
  openTab(tab: Tab, active: boolean): Task<void>;
  openTabInNewWindow(tab: Tab): Task<void>;
  close(tabs: ReadonlyNonEmptyArray<BrowserTab>): Task<void>;
}
