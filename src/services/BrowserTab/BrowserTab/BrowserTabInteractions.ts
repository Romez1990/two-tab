import { ReadonlyNonEmptyArray } from 'fp-ts/ReadonlyNonEmptyArray';
import { Task } from 'fp-ts/Task';
import { BrowserTab } from './BrowserTab';
import { BrowserWindow } from './BrowserWindow';
import { OpenProperties } from './OpenProperties';
import { OpenInNewWindowProperties } from './OpenInNewWindowProperties';

export interface BrowserTabInteractions {
  getTabsInCurrentWindow(): Task<ReadonlyNonEmptyArray<BrowserTab>>;
  getWindows(): Task<ReadonlyNonEmptyArray<BrowserWindow>>;
  open(openProperties: OpenProperties): Task<BrowserTab>;
  openInNewWindow(openProperties: OpenInNewWindowProperties): Task<BrowserWindow>;
  close(tabs: ReadonlyNonEmptyArray<BrowserTab>): Task<void>;
}
