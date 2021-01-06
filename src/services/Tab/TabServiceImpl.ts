import { TabService } from './TabService';

type Tab = chrome.tabs.Tab;

export class TabServiceImpl implements TabService {
  public getAllInWindow(): Promise<Tab> {
    return new Promise(resolve =>
      chrome.tabs.getAllInWindow(tabs => {
        if (typeof tabs === 'undefined') throw new Error('tabs is undefined');
        resolve(tabs);
      }),
    );
  }
}
