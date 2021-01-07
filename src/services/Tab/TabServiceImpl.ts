import { pipe } from 'fp-ts/pipeable';
import { Task, map } from 'fp-ts/lib/Task';
import { filter } from 'fp-ts/lib/ReadonlyArray';
import { fold } from 'fp-ts/lib/boolean';
import { not } from 'fp-ts/lib/function';
import { TabService } from './TabService';
import { Tab } from './Tab';
import { BrowserTabService } from './BrowserTab';
import { ExtensionService } from '../Extension';

export class TabServiceImpl implements TabService {
  public constructor(private readonly browserTabService: BrowserTabService, extensionService: ExtensionService) {
    this.extensionURL = extensionService.getURL('/');
    console.log(this.extensionURL);
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
    return pipe(tabs, filter(not(this.isTabPinned)), filter(not(this.isTabOfExtension)));
  }

  private isTabPinned(tab: Tab): boolean {
    return tab.pinned;
  }

  private isTabOfExtension(tab: Tab): boolean {
    return tab.url.startsWith(this.extensionURL);
  }
}
