import { ReadonlyNonEmptyArray } from 'fp-ts/ReadonlyNonEmptyArray';
import { Task } from 'fp-ts/Task';
import { BrowserTab } from './BrowserTab';
import { BrowserWindow } from './BrowserWindow';
import { OpenProperties } from './OpenProperties';

export interface BrowserTabInteractions {
  getTabsInCurrentWindow(): Task<ReadonlyNonEmptyArray<BrowserTab>>;
  getWindows(): Task<ReadonlyNonEmptyArray<BrowserWindow>>;
  open(openProperties: OpenProperties): Task<BrowserTab>;
  close(tabs: ReadonlyNonEmptyArray<BrowserTab>): Task<void>;
}
