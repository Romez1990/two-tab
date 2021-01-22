import { pipe, constVoid } from 'fp-ts/function';
import { map as mapA, filter } from 'fp-ts/ReadonlyArray';
import { ReadonlyNonEmptyArray, map as mapN, head, tail } from 'fp-ts/ReadonlyNonEmptyArray';
import { Task, map, chain, sequenceArray } from 'fp-ts/Task';
import { ExtensionService } from '../Extension';
import {
  BrowserTabInteractions,
  BrowserTab,
  BrowserWindow,
  TabOpenProperties,
  TabUpdateProperties,
} from './BrowserTab';
import { BrowserTabService } from './BrowserTabService';
import { TabList, Tab } from '../../Storage/TabList';

export class BrowserTabServiceImpl implements BrowserTabService {
  public constructor(private readonly browserTabInteractions: BrowserTabInteractions, extension: ExtensionService) {
    this.extensionURL = extension.getURL('/');
  }

  private readonly extensionURL: string;

  public getTabsInCurrentWindow = (all: boolean): Task<ReadonlyArray<BrowserTab>> =>
    pipe(
      this.browserTabInteractions.getTabsInCurrentWindow(),
      map(tabs => (all ? tabs : this.filterTabs(tabs))),
    );

  private filterTabs = (tabs: ReadonlyArray<BrowserTab>): ReadonlyArray<BrowserTab> =>
    pipe(
      tabs,
      filter(tab => !this.isTabPinned(tab) && !this.isExtensionTab(tab) && !this.isNewTab(tab)),
    );

  private isTabPinned = ({ pinned }: BrowserTab): boolean => pinned;

  public getWindows = (): Task<ReadonlyArray<BrowserWindow>> => this.browserTabInteractions.getWindows();

  public openTabList = ({ tabs }: TabList): Task<void> =>
    pipe(
      tabs,
      mapN(this.tabToOpenProperties(false)),
      mapN(this.browserTabInteractions.openTab.bind(this.browserTabInteractions)),
      sequenceArray,
      map(constVoid),
    );

  public openTabListInNewWindow = ({ tabs }: TabList, focused: boolean): Task<void> => {
    const tabsHead = head(tabs);
    const tabsTail = tail(tabs);
    return pipe(
      this.browserTabInteractions.openWindow({ url: tabsHead.url, focused }),
      chain(window =>
        pipe(
          tabsTail,
          mapA(this.tabToOpenProperties(false, window.id)),
          mapA(this.browserTabInteractions.openTab.bind(this.browserTabInteractions)),
          sequenceArray,
        ),
      ),
      map(constVoid),
    );
  };

  private tabToOpenProperties = (active: boolean, windowId?: number) => ({ url, pinned }: Tab): TabOpenProperties => ({
    url,
    pinned,
    active,
    windowId,
  });

  public openTab = (properties: TabOpenProperties): Task<BrowserTab> => this.browserTabInteractions.openTab(properties);

  public updateTab = (tab: BrowserTab, properties: TabUpdateProperties): Task<BrowserTab> =>
    this.browserTabInteractions.updateTab(tab, properties);

  public close = (tabs: ReadonlyNonEmptyArray<BrowserTab>): Task<void> => this.browserTabInteractions.closeTabs(tabs);

  public isExtensionTab = ({ url }: BrowserTab): boolean => url.startsWith(this.extensionURL);

  public isNewTab = (tab: BrowserTab): boolean => this.browserTabInteractions.isNewTab(tab);
}
