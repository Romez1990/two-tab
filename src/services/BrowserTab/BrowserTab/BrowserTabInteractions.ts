import { Task } from 'fp-ts/Task';
import { BrowserTab } from './BrowserTab';
import { BrowserWindow } from './BrowserWindow';
import { OpenProperties } from './OpenProperties';

export interface BrowserTabInteractions {
  getTabsInCurrentWindow(): Task<ReadonlyArray<BrowserTab>>;
  getWindows(): Task<ReadonlyArray<BrowserWindow>>;
  open(openProperties: OpenProperties): Task<BrowserTab>;
  close(tabs: ReadonlyArray<BrowserTab>): Task<void>;
}
