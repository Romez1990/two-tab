import { pipe, flow } from 'fp-ts/function';
import { toArray } from 'fp-ts/ReadonlyArray';
import { ReadonlyNonEmptyArray, map } from 'fp-ts/ReadonlyNonEmptyArray';
import { checkNonEmpty } from '../../../Utils/fp-ts/ReadonlyArray';
import { InvalidChromeTabError, InvalidChromeWindowError } from './Errors';
import { BrowserTabInteractions } from './BrowserTabInteractions';
import { BrowserTab, idLens } from './BrowserTab';
import { BrowserWindow } from './BrowserWindow';
import { ChromeTab } from './ChromeTab';
import { ChromeWindow } from './ChromeWindow';
import { TabOpenProperties } from './TabOpenProperties';
import { TabUpdateProperties } from './TabUpdateProperties';
import { WindowOpenProperties } from './WindowOpenProperties';

export class ChromeTabInteractions implements BrowserTabInteractions {
  public getTabsInCurrentWindow = () => (): Promise<ReadonlyNonEmptyArray<BrowserTab>> =>
    new Promise(resolve =>
      chrome.tabs.query(
        {
          currentWindow: true,
        },
        flow(
          this.toBrowserTabs.bind(this),
          resolve,
          //
        ),
      ),
    );

  public getWindows = () => (): Promise<ReadonlyNonEmptyArray<BrowserWindow>> =>
    new Promise(resolve =>
      chrome.windows.getAll(
        {
          populate: true,
        },
        flow(
          this.toBrowserWindows.bind(this),
          resolve,
          //
        ),
      ),
    );

  public openTab = (properties: TabOpenProperties) => (): Promise<BrowserTab> =>
    new Promise(resolve =>
      chrome.tabs.create(
        properties,
        flow(
          this.toBrowserTab.bind(this),
          resolve,
          //
        ),
      ),
    );

  public updateTab = ({ id }: BrowserTab, properties: TabUpdateProperties) => (): Promise<BrowserTab> =>
    new Promise(resolve =>
      chrome.tabs.update(
        id,
        properties,
        flow(
          this.toBrowserTab.bind(this),
          resolve,
          //
        ),
      ),
    );

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

  public openWindow = (properties: WindowOpenProperties) => (): Promise<BrowserWindow> =>
    new Promise(resolve =>
      chrome.windows.create(
        properties,
        flow(
          this.toBrowserWindow.bind(this),
          resolve,
          //
        ),
      ),
    );

  private toBrowserTabs = (tabs: ReadonlyArray<ChromeTab>): ReadonlyNonEmptyArray<BrowserTab> =>
    pipe(
      tabs,
      checkNonEmpty<ChromeTab>('tabs'),
      map(this.toBrowserTab.bind(this)),
      //
    );

  private toBrowserWindows = (windows: ReadonlyArray<ChromeWindow>): ReadonlyNonEmptyArray<BrowserWindow> =>
    pipe(
      windows,
      checkNonEmpty<ChromeWindow>('windows'),
      map(this.toBrowserWindow),
      //
    );

  private toBrowserTab(tab: ChromeTab | undefined): BrowserTab {
    if (typeof tab === 'undefined') {
      throw new InvalidChromeTabError(tab);
    }
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

  private toBrowserWindow(window: ChromeWindow | undefined): BrowserWindow {
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
      tabs: this.toBrowserTabs(tabs),
    };
  }

  public isNewTab = ({ url }: BrowserTab): boolean => url === 'chrome://newtab/';
}
