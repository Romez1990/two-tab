import { BrowserTab } from './BrowserTab';

export interface BrowserWindow {
  readonly id: number;
  readonly incognito: boolean;
  readonly focused: boolean;
  readonly tabs: ReadonlyArray<BrowserTab>;
}
