import { pipe } from 'fp-ts/function';
import { toArray } from 'fp-ts/ReadonlyArray';
import { ReadonlyNonEmptyArray, map } from 'fp-ts/ReadonlyNonEmptyArray';
import { checkNonEmpty } from '../../Utils/fp-ts/ReadonlyArray';
import { InvalidChromeTabError, InvalidChromeWindowError } from './Errors';
import { BrowserTabInteractions } from './BrowserTabInteractions';
import { BrowserTab, idLens } from './BrowserTab';
import { BrowserWindow } from './BrowserWindow';
import { ChromeTab } from './ChromeTab';
import { ChromeWindow } from './ChromeWindow';
import { TabOpenProperties } from './TabOpenProperties';
import { WindowOpenProperties } from './WindowOpenProperties';

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

  public openTab = (properties: TabOpenProperties) => (): Promise<BrowserTab> =>
    new Promise(resolve => chrome.tabs.create(properties, tab => resolve(this.mapTab(tab))));

  public openWindow = (properties: WindowOpenProperties) => (): Promise<BrowserWindow> =>
    new Promise(resolve => chrome.windows.create(properties, window => resolve(this.mapWindow(window))));

  public closeTabs = (tabs: ReadonlyNonEmptyArray<BrowserTab>) => (): Promise<void> =>
    new Promise(resolve =>
      pipe(
        tabs,
        map(idLens.get),
        toArray,
        tabIds => chrome.tabs.remove(tabIds, resolve),
        //
      ),
    );

  private mapTabs = (tabs: ReadonlyArray<ChromeTab>): ReadonlyNonEmptyArray<BrowserTab> =>
    pipe(
      tabs,
      checkNonEmpty<ChromeTab>('tabs'),
      map(this.mapTab.bind(this)),
      //
    );

  private mapWindows = (windows: ReadonlyArray<ChromeWindow>): ReadonlyNonEmptyArray<BrowserWindow> =>
    pipe(
      windows,
      checkNonEmpty<ChromeWindow>('windows'),
      map(this.mapWindow),
      //
    );

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
