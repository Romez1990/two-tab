import { pipe } from 'fp-ts/function';
import { isNonEmpty, toArray } from 'fp-ts/ReadonlyArray';
import { ReadonlyNonEmptyArray, map } from 'fp-ts/ReadonlyNonEmptyArray';
import { BrowserTabInteractions } from './BrowserTabInteractions';
import { BrowserTab } from './BrowserTab';
import { BrowserWindow } from './BrowserWindow';
import { OpenProperties } from './OpenProperties';
import { ChromeTab } from './ChromeTab';
import { ChromeWindow } from './ChromeWindow';
import { ArrayIsEmptyError, InvalidChromeTabError, InvalidChromeWindowError } from './Errors';

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

  private mapTabs = (tabs: ReadonlyArray<ChromeTab>): ReadonlyNonEmptyArray<BrowserTab> =>
    pipe(tabs, this.checkNonEmpty<ChromeTab>('tabs'), map(this.mapTab.bind(this)));

  private mapWindows = (windows: ReadonlyArray<ChromeWindow>): ReadonlyNonEmptyArray<BrowserWindow> =>
    pipe(windows, this.checkNonEmpty<ChromeWindow>('windows'), map(this.mapWindow));

  private checkNonEmpty = <T>(arrayName: string) => (array: ReadonlyArray<T>): ReadonlyNonEmptyArray<T> =>
    isNonEmpty(array) ? array : new ArrayIsEmptyError(arrayName).throw();

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

  private mapWindow(window: ChromeWindow): BrowserWindow {
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

  public open = (openProperties: OpenProperties) => (): Promise<BrowserTab> =>
    new Promise(resolve => chrome.tabs.create(openProperties, tab => resolve(this.mapTab(tab))));

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
}
