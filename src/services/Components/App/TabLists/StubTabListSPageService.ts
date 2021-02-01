import { Task, of } from 'fp-ts/Task';
import { TaskOption } from 'fp-ts-contrib/TaskOption';
import { TabList } from '../../../Storage/TabList';
import { TabListSPageService } from './TabListSPageService';
import { NotImplementedError } from '../../../Infrastructure/Error';

export class StubTabListSPageService implements TabListSPageService {
  public addUpdateHandlers(): void {
    //
  }

  public removeUpdateHandlers(): void {
    //
  }

  public getTabLists = (): Task<ReadonlyArray<TabList>> =>
    of([
      {
        id: 1,
        name: 'Overview',
        createdAt: new Date(2019, 5, 15, 9, 7),
        tabs: [
          {
            id: 1,
            title: 'Telegram Web',
            url: 'https://web.telegram.org/#/login',
            favIconUrl: 'https://web.telegram.org/favicon.ico',
            pinned: false,
          },
        ],
      },
    ]);

  public openTabList(): Task<void> {
    throw new NotImplementedError();
  }

  public openTabListInNewWindow(): Task<void> {
    throw new NotImplementedError();
  }

  public deleteTabList(): Task<void> {
    throw new NotImplementedError();
  }

  public deleteTab(): TaskOption<TabList> {
    throw new NotImplementedError();
  }
}
