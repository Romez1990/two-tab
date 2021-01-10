import { map, toArray } from 'fp-ts/ReadonlyArray';
import { pipe } from 'fp-ts/function';
import { BrowserTabService } from './BrowserTabService';
import { Tab } from './Tab';
import { BrowserWindow } from './BrowserWindow';
import { OpenProperties } from './OpenProperties';
import { ChromeTab } from './ChromeTab';
import { ChromeWindow } from './ChromeWindow';
import { InvalidChromeTabError, InvalidChromeWindowError } from './Errors';

export class ChromeTabService implements BrowserTabService {
  public getTabsInCurrentWindow = () => (): Promise<ReadonlyArray<Tab>> =>
    new Promise(resolve =>
      chrome.tabs.query(
        {
          currentWindow: true,
        },
        tabs => resolve(this.mapTabs(tabs)),
      ),
    );

  public getWindows = () => (): Promise<ReadonlyArray<BrowserWindow>> =>
    new Promise(resolve =>
      chrome.windows.getAll(
        {
          populate: true,
        },
        windows => resolve(this.mapWindows(windows)),
      ),
    );

  private mapTabs = (tabs: ReadonlyArray<ChromeTab>): ReadonlyArray<Tab> => map(this.mapTab.bind(this))(tabs);

  private mapWindows = (windows: ReadonlyArray<ChromeWindow>): ReadonlyArray<BrowserWindow> =>
    map(this.mapWindow)(windows);

  private mapTab(tab: ChromeTab): Tab {
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

  public open = (openProperties: OpenProperties) => (): Promise<Tab> =>
    new Promise(resolve => chrome.tabs.create(openProperties, tab => resolve(this.mapTab(tab))));

  public close = (tabs: ReadonlyArray<Tab>) => (): Promise<void> =>
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
