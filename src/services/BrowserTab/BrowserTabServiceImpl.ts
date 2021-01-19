import { pipe, constVoid } from 'fp-ts/function';
import { fold } from 'fp-ts/boolean';
import { filter } from 'fp-ts/ReadonlyArray';
import { ReadonlyNonEmptyArray, map as mapN } from 'fp-ts/ReadonlyNonEmptyArray';
import { Task, map, chain, sequenceArray } from 'fp-ts/Task';
import { ExtensionService } from '../Extension';
import { BrowserTabInteractions, BrowserTab, BrowserWindow, TabOpenProperties } from './BrowserTab';
import { BrowserTabService } from './BrowserTabService';
import { Tab, TabList } from '../TabList';

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

  public openTabList = ({ tabs }: TabList): Task<void> =>
    pipe(
      tabs,
      mapN(this.tabToOpenProperties(false)),
      mapN(this.browserTabInteractions.openTab.bind(this.browserTabInteractions)),
      sequenceArray,
      map(constVoid),
    );

  public openTabListInNewWindow = ({ tabs }: TabList, focused: boolean): Task<void> =>
    pipe(
      this.browserTabInteractions.openWindow({ focused }),
      chain(window =>
        pipe(
          tabs,
          mapN(this.tabToOpenProperties(false, window.id)),
          mapN(this.browserTabInteractions.openTab.bind(this.browserTabInteractions)),
          sequenceArray,
        ),
      ),
      map(constVoid),
    );

  private tabToOpenProperties = (active: boolean, windowId?: number) => ({ url, pinned }: Tab): TabOpenProperties => ({
    url,
    pinned,
    active,
    windowId,
  });

  public openTab = ({ url, pinned }: Tab, active: boolean): Task<void> =>
    pipe(
      this.browserTabInteractions.openTab({ url, pinned, active }),
      map(constVoid),
      //
    );

  public openTabInNewWindow = ({ url }: Tab): Task<void> =>
    pipe(
      this.browserTabInteractions.openWindow({ focused: true }),
      map(window => this.browserTabInteractions.openTab({ url, pinned: false, active: true, windowId: window.id })),
      map(constVoid),
    );

  public close = (tabs: ReadonlyNonEmptyArray<BrowserTab>): Task<void> => this.browserTabInteractions.closeTabs(tabs);
}
