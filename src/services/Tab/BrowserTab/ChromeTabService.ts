import { Task } from 'fp-ts/lib/Task';
import { map, toArray } from 'fp-ts/lib/ReadonlyArray';
import { pipe } from 'fp-ts/pipeable';
import { BrowserTabService } from './BrowserTabService';
import { Tab } from './Tab';
import { BrowserWindow } from './BrowserWindow';
import { OpenProperties } from './OpenProperties';
import { LoggerService } from '../../Logger';
import { ChromeTab } from './ChromeTab';
import { ChromeWindow } from './ChromeWindow';
import { InvalidChromeTabError, InvalidChromeWindowError } from './Errors';

export class ChromeTabService implements BrowserTabService {
  public constructor(private readonly loggerService: LoggerService) {}

  public getTabsInCurrentWindow(): Task<ReadonlyArray<Tab>> {
    return (): Promise<ReadonlyArray<Tab>> =>
      new Promise(resolve =>
        chrome.tabs.query(
          {
            currentWindow: true,
          },
          tabs => resolve(this.mapTabs(tabs)),
        ),
      );
  }

  public getWindows(): Task<ReadonlyArray<BrowserWindow>> {
    return (): Promise<ReadonlyArray<BrowserWindow>> =>
      new Promise(resolve =>
        chrome.windows.getAll(
          {
            populate: true,
          },
          windows => resolve(this.mapWindows(windows)),
        ),
      );
  }

  private mapTabs(tabs: ReadonlyArray<ChromeTab>): ReadonlyArray<Tab> {
    return map(this.mapTab)(tabs);
  }

  private mapWindows(windows: ReadonlyArray<ChromeWindow>): ReadonlyArray<BrowserWindow> {
    return map(this.mapWindow)(windows);
  }

  private mapTab(tab: ChromeTab): Tab {
    const { id, windowId, title, url, favIconUrl, pinned } = tab;
    if (typeof id === 'undefined' || typeof title === 'undefined' || typeof url === 'undefined') {
      this.loggerService.log(tab);
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
      this.loggerService.log(tabs);
      throw new InvalidChromeWindowError(window);
    }
    return {
      id,
      incognito,
      focused,
      tabs: this.mapTabs(tabs),
    };
  }

  public open(openProperties: OpenProperties): Task<Tab> {
    return (): Promise<Tab> =>
      new Promise(resolve => chrome.tabs.create(openProperties, tab => resolve(this.mapTab(tab))));
  }

  public close(tabs: ReadonlyArray<Tab>): Task<void> {
    return (): Promise<void> =>
      new Promise(resolve => chrome.tabs.remove(pipe(tabs, map(this.getTagId), toArray), resolve));
  }

  private getTagId(tab: Tab): number {
    return tab.id;
  }
}
