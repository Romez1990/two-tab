import { pipe } from 'fp-ts/function';
import { Task, map } from 'fp-ts/Task';
import { filter } from 'fp-ts/ReadonlyArray';
import { fold } from 'fp-ts/boolean';
import { ExtensionService } from '../Extension';
import { BrowserTabService, Tab, BrowserWindow } from './BrowserTab';
import { TabService } from './TabService';

export class TabServiceImpl implements TabService {
  public constructor(private readonly browserTabService: BrowserTabService, extensionService: ExtensionService) {
    this.extensionURL = extensionService.getURL('/');
  }

  private readonly extensionURL: string;

  public getTabsInCurrentWindow = (all: boolean): Task<ReadonlyArray<Tab>> =>
    pipe(
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

  private filterTabs = (tabs: ReadonlyArray<Tab>): ReadonlyArray<Tab> =>
    pipe(
      tabs,
      filter(tab => !this.isTabPinned(tab) && !this.isTabOfExtension(tab)),
    );

  private isTabPinned = (tab: Tab): boolean => tab.pinned;

  private isTabOfExtension = (tab: Tab): boolean => tab.url.startsWith(this.extensionURL);

  public getWindows = (): Task<ReadonlyArray<BrowserWindow>> => this.browserTabService.getWindows();

  public close = (tabs: ReadonlyArray<Tab>): Task<void> => this.browserTabService.close(tabs);
}
