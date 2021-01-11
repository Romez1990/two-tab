import { pipe } from 'fp-ts/function';
import { Task, map } from 'fp-ts/Task';
import { filter } from 'fp-ts/ReadonlyArray';
import { fold } from 'fp-ts/boolean';
import { ExtensionService } from '../Extension';
import { BrowserTabInteractions, BrowserTab, BrowserWindow } from './BrowserTab';
import { BrowserTabService } from './BrowserTabService';

export class BrowserTabServiceImpl implements BrowserTabService {
  public constructor(private readonly browserTabService: BrowserTabInteractions, extensionService: ExtensionService) {
    this.extensionURL = extensionService.getURL('/');
  }

  private readonly extensionURL: string;

  public getTabsInCurrentWindow = (all: boolean): Task<ReadonlyArray<BrowserTab>> =>
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

  private filterTabs = (tabs: ReadonlyArray<BrowserTab>): ReadonlyArray<BrowserTab> =>
    pipe(
      tabs,
      filter(tab => !this.isTabPinned(tab) && !this.isTabOfExtension(tab)),
    );

  private isTabPinned = (tab: BrowserTab): boolean => tab.pinned;

  private isTabOfExtension = (tab: BrowserTab): boolean => tab.url.startsWith(this.extensionURL);

  public getWindows = (): Task<ReadonlyArray<BrowserWindow>> => this.browserTabService.getWindows();

  public close = (tabs: ReadonlyArray<BrowserTab>): Task<void> => this.browserTabService.close(tabs);
}
