import { pipe } from 'fp-ts/function';
import { Task } from 'fp-ts/Task';
import { ExtensionService } from '../Extension';
import { TabService, Tab, BrowserWindow } from '../Tab';
import { PopupService } from './PopupService';

export class PopupServiceImpl implements PopupService {
  public constructor(private readonly extensionService: ExtensionService, private readonly tabService: TabService) {
    this.appUrl = extensionService.getURL('index.html');
  }

  public readonly appUrl: string;

  public getTabsInCurrentWindow = (all: boolean): Task<ReadonlyArray<Tab>> =>
    this.tabService.getTabsInCurrentWindow(all);

  public getWindows = (): Task<ReadonlyArray<BrowserWindow>> => this.tabService.getWindows();

  public saveTabs = (tabs: ReadonlyArray<Tab>): Task<void> => pipe(this.tabService.close(tabs));
}
