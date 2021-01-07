import { Task } from 'fp-ts/lib/Task';
import { BrowserTabService } from './BrowserTabService';
import { Tab } from '../Tab';

type ChromeTab = chrome.tabs.Tab;

export class ChromeTabService implements BrowserTabService {
  public getTabsInCurrentWindow(): Task<ReadonlyArray<Tab>> {
    return (): Promise<ReadonlyArray<Tab>> =>
      new Promise<ReadonlyArray<Tab>>(resolve => {
        chrome.tabs.query(
          {
            currentWindow: true,
          },
          tabs => resolve(tabs.map(this.mapTab)),
        );
      });
  }

  private mapTab(tab: ChromeTab): Tab {
    console.log(tab);
    const { id, windowId, title, url, favIconUrl, pinned } = tab;
    if (typeof id === 'undefined' || typeof title === 'undefined' || typeof url === 'undefined') {
      console.log(tab);
      throw new Error();
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
}
