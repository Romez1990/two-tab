import { pipe, constVoid } from 'fp-ts/function';
import { ReadonlyNonEmptyArray } from 'fp-ts/ReadonlyNonEmptyArray';
import { some, none } from 'fp-ts/Option';
import { Task, map, chain } from 'fp-ts/Task';
import { TaskOption, fold } from 'fp-ts-contrib/TaskOption';
import { ExtensionService } from '../../Browser/Extension';
import { BrowserTabService, BrowserTab, BrowserWindow } from '../../Browser/BrowserTab';
import { TabListService } from '../../Storage/TabList';
import { unsafeLookup } from '../../Utils/fp-ts/ReadonlyArray';
import { PopupService } from './PopupService';

export class PopupServiceImpl implements PopupService {
  public constructor(
    private readonly tabListService: TabListService,
    private readonly browserTabService: BrowserTabService,
    extension: ExtensionService,
  ) {
    this.appUrl = extension.getURL('index.html');
  }

  private readonly appUrl: string;

  public openApp = (): Task<void> =>
    pipe(
      this.getTabsInCurrentWindow(true),
      chain(this.getTheNewTabIfNoOtherTabsInCurrentWindow.bind(this)),
      fold(
        () => this.browserTabService.openTab({ url: this.appUrl, pinned: false, active: true }),
        theNewTab => this.browserTabService.updateTab(theNewTab, { url: this.appUrl }),
      ),
      map(constVoid),
    );

  private getTheNewTabIfNoOtherTabsInCurrentWindow = (): TaskOption<BrowserTab> =>
    pipe(
      this.getTabsInCurrentWindow(true),
      map(tabs => (tabs.length === 1 ? some(unsafeLookup(0, tabs)) : none)),
    );

  public getTabsInCurrentWindow = (all: boolean): Task<ReadonlyArray<BrowserTab>> =>
    this.browserTabService.getTabsInCurrentWindow(all);

  public getWindows = (): Task<ReadonlyArray<BrowserWindow>> => this.browserTabService.getWindows();

  public saveTabs = (listName: string, tabs: ReadonlyNonEmptyArray<BrowserTab>): Task<void> =>
    pipe(
      this.tabListService.addTabList(listName, tabs),
      chain(() => this.browserTabService.close(tabs)),
    );
}
