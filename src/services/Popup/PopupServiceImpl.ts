import { pipe } from 'fp-ts/function';
import { Task } from 'fp-ts/Task';
import { ExtensionService } from '../Extension';
import { TabService, BrowserTab, BrowserWindow } from '../BrowserTab';
import { PopupService } from './PopupService';

export class PopupServiceImpl implements PopupService {
  public constructor(private readonly extensionService: ExtensionService, private readonly tabService: TabService, ) {
    this.appUrl = extensionService.getURL('index.html');
  }

  public readonly appUrl: string;

  public getTabsInCurrentWindow = (all: boolean): Task<ReadonlyArray<BrowserTab>> =>
    this.tabService.getTabsInCurrentWindow(all);

  public getWindows = (): Task<ReadonlyArray<BrowserWindow>> => this.tabService.getWindows();

  public saveTabs = (tabs: ReadonlyArray<BrowserTab>): Task<void> => pipe(this.tabService.close(tabs), );
}