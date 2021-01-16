import { pipe } from 'fp-ts/function';
import { toArray } from 'fp-ts/ReadonlyArray';
import { ReadonlyNonEmptyArray, map } from 'fp-ts/ReadonlyNonEmptyArray';
import { checkNonEmpty } from '../../Utils/fp-ts/ReadonlyArray';
import { BrowserTabInteractions } from './BrowserTabInteractions';
import { BrowserTab } from './BrowserTab';
import { BrowserWindow } from './BrowserWindow';
import { OpenProperties } from './OpenProperties';
import { ChromeTab } from './ChromeTab';
import { ChromeWindow } from './ChromeWindow';
import { InvalidChromeTabError, InvalidChromeWindowError } from './Errors';
import { OpenInNewWindowProperties } from './OpenInNewWindowProperties';

export class ChromeTabInteractions implements BrowserTabInteractions {
  public getTabsInCurrentWindow = () => (): Promise<ReadonlyNonEmptyArray<BrowserTab>> =>
    new Promise(resolve =>
      chrome.tabs.query(
        {
          currentWindow: true,
        },
        tabs => resolve(this.mapTabs(tabs)),
      ),
    );

  public getWindows = () => (): Promise<ReadonlyNonEmptyArray<BrowserWindow>> =>
    new Promise(resolve =>
      chrome.windows.getAll(
        {
          populate: true,
        },
        windows => resolve(this.mapWindows(windows)),
      ),
    );

  public open = (openProperties: OpenProperties) => (): Promise<BrowserTab> =>
    new Promise(resolve => chrome.tabs.create(openProperties, tab => resolve(this.mapTab(tab))));

  public openInNewWindow = (openInNewWindowProperties: OpenInNewWindowProperties) => (): Promise<BrowserWindow> =>
    new Promise(resolve => chrome.windows.create(openInNewWindowProperties, window => resolve(this.mapWindow(window))));

  public close = (tabs: ReadonlyNonEmptyArray<BrowserTab>) => (): Promise<void> =>
    new Promise(resolve =>
      chrome.tabs.remove(
        pipe(
          tabs,
          map(tab => tab.id),
          toArray,
        ),
        resolve,
      ),
    );

  private mapTabs = (tabs: ReadonlyArray<ChromeTab>): ReadonlyNonEmptyArray<BrowserTab> =>
    pipe(tabs, checkNonEmpty<ChromeTab>('tabs'), map(this.mapTab.bind(this)));

  private mapWindows = (windows: ReadonlyArray<ChromeWindow>): ReadonlyNonEmptyArray<BrowserWindow> =>
    pipe(windows, checkNonEmpty<ChromeWindow>('windows'), map(this.mapWindow));

  private mapTab(tab: ChromeTab): BrowserTab {
    const { id, windowId, title, url, favIconUrl, pinned } = tab;
    if (typeof id === 'undefined' || typeof title === 'undefined' || typeof url === 'undefined') {
      throw new InvalidChromeTabError(tab);
    }
    return {
      id,
      windowId,
      title,
      url,
      favIconUrl,
      pinned,
    };
  }

  private mapWindow(window: ChromeWindow | undefined): BrowserWindow {
    if (typeof window === 'undefined') {
      throw new InvalidChromeWindowError(window);
    }
    const { id, incognito, focused, tabs } = window;
    if (typeof tabs === 'undefined') {
      throw new InvalidChromeWindowError(window);
    }
    return {
      id,
      incognito,
      focused,
      tabs: this.mapTabs(tabs),
    };
  }
}
