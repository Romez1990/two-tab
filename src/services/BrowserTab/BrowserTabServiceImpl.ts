import { pipe } from 'fp-ts/function';
import { fold } from 'fp-ts/boolean';
import { filter } from 'fp-ts/ReadonlyArray';
import { ReadonlyNonEmptyArray } from 'fp-ts/ReadonlyNonEmptyArray';
import { Task, map } from 'fp-ts/Task';
import { ExtensionService } from '../Extension';
import { BrowserTabInteractions, BrowserTab, BrowserWindow, OpenProperties } from './BrowserTab';
import { BrowserTabService } from './BrowserTabService';

export class BrowserTabServiceImpl implements BrowserTabService {
  public constructor(private readonly browserTabInteractions: BrowserTabInteractions, extension: ExtensionService) {
    this.extensionURL = extension.getURL('/');
  }

  private readonly extensionURL: string;

  public getTabsInCurrentWindow = (all: boolean): Task<ReadonlyArray<BrowserTab>> =>
    pipe(
      this.browserTabInteractions.getTabsInCurrentWindow(),
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
      filter(tab => !this.isTabPinned(tab) && !this.isTabOfExtension(tab) && !this.isNewTab(tab)),
    );

  private isTabPinned = (tab: BrowserTab): boolean => tab.pinned;

  private isTabOfExtension = (tab: BrowserTab): boolean => tab.url.startsWith(this.extensionURL);

  private isNewTab = (tab: BrowserTab): boolean => tab.url === 'chrome://newtab/';

  public getWindows = (): Task<ReadonlyArray<BrowserWindow>> => this.browserTabInteractions.getWindows();

  public open = (openProperties: OpenProperties): Task<BrowserTab> => this.browserTabInteractions.open(openProperties);

  public close = (tabs: ReadonlyNonEmptyArray<BrowserTab>): Task<void> => this.browserTabInteractions.close(tabs);
}
