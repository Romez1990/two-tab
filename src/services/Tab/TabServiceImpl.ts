import { pipe } from 'fp-ts/pipeable';
import { Task, map } from 'fp-ts/lib/Task';
import { filter } from 'fp-ts/lib/ReadonlyArray';
import { fold } from 'fp-ts/lib/boolean';
import { ExtensionService } from '../Extension';
import { BrowserTabService, Tab, BrowserWindow } from './BrowserTab';
import { TabService } from './TabService';

export class TabServiceImpl implements TabService {
  public constructor(private readonly browserTabService: BrowserTabService, extensionService: ExtensionService) {
    this.extensionURL = extensionService.getURL('/');
  }

  private readonly extensionURL: string;

  public getTabsInCurrentWindow(all: boolean): Task<ReadonlyArray<Tab>> {
    return pipe(
      this.browserTabService.getTabsInCurrentWindow(),
      map(tabs =>
        pipe(
          all,
          fold(
            () => this.filterTabs(tabs),
            () => tabs,
          ),
        ),
      ),
    );
  }

  private filterTabs(tabs: ReadonlyArray<Tab>): ReadonlyArray<Tab> {
    return pipe(
      tabs,
      filter(tab => !this.isTabPinned(tab) && !this.isTabOfExtension(tab)),
    );
  }

  private isTabPinned(tab: Tab): boolean {
    return tab.pinned;
  }

  private isTabOfExtension(tab: Tab): boolean {
    return tab.url.startsWith(this.extensionURL);
  }

  public getWindows(): Task<ReadonlyArray<BrowserWindow>> {
    return this.browserTabService.getWindows();
  }

  public close(tabs: ReadonlyArray<Tab>): Task<void> {
    return this.browserTabService.close(tabs);
  }
}
