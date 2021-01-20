import { pipe } from 'fp-ts/function';
import { ReadonlyNonEmptyArray } from 'fp-ts/ReadonlyNonEmptyArray';
import { Task, chain } from 'fp-ts/Task';
import { ExtensionService } from '../Extension';
import { BrowserTabService, BrowserTab, BrowserWindow } from '../BrowserTab';
import { TabListService } from '../TabList';
import { PopupService } from './PopupService';

export class PopupServiceImpl implements PopupService {
  public constructor(
    private readonly tabListService: TabListService,
    private readonly browserTabService: BrowserTabService,
    private readonly extension: ExtensionService,
  ) {
    this.appUrl = extension.getURL('index.html');
  }

  public readonly appUrl: string;

  public getTabsInCurrentWindow = (all: boolean): Task<ReadonlyArray<BrowserTab>> =>
    this.browserTabService.getTabsInCurrentWindow(all);

  public getWindows = (): Task<ReadonlyArray<BrowserWindow>> => this.browserTabService.getWindows();

  public saveTabs = (listName: string, tabs: ReadonlyNonEmptyArray<BrowserTab>): Task<void> =>
    pipe(
      this.tabListService.addTabList(listName, tabs),
      chain(() => this.browserTabService.close(tabs)),
    );
}
