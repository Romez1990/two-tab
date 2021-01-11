import { constant, pipe } from 'fp-ts/function';
import { Task, chain } from 'fp-ts/Task';
import { ExtensionService } from '../Extension';
import { BrowserTabService, BrowserTab, BrowserWindow } from '../BrowserTab';
import { TabListService } from '../TabList';
import { PopupService } from './PopupService';

export class PopupServiceImpl implements PopupService {
  public constructor(
    private readonly extensionService: ExtensionService,
    private readonly browserTabService: BrowserTabService,
    private readonly tabListService: TabListService,
  ) {
    this.appUrl = extensionService.getURL('index.html');
  }

  public readonly appUrl: string;

  public getTabsInCurrentWindow = (all: boolean): Task<ReadonlyArray<BrowserTab>> =>
    this.browserTabService.getTabsInCurrentWindow(all);

  public getWindows = (): Task<ReadonlyArray<BrowserWindow>> => this.browserTabService.getWindows();

  public saveTabs = (listName: string, tabs: ReadonlyArray<BrowserTab>): Task<void> =>
    pipe(this.tabListService.save(listName, tabs), chain(constant(this.browserTabService.close(tabs))));
}
