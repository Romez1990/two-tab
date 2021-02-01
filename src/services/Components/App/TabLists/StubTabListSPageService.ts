import { Task, of } from 'fp-ts/Task';
import { TaskOption, some } from 'fp-ts-contrib/TaskOption';
import { TabList } from '../../../Storage/TabList';
import { TabListSPageService } from './TabListSPageService';

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
        createdAt: new Date(2019, 5, 7, 9, 7),
        tabs: [
          {
            id: 1,
            title: 'Telegram Web',
            url: 'https://web.telegram.org/#/login',
            favIconUrl: 'https://web.telegram.org/favicon.ico',
            pinned: false,
          },
          {
            id: 2,
            title: 'Instagram',
            url: 'https://www.instagram.com/',
            favIconUrl: 'https://www.instagram.com/static/images/ico/favicon.ico/36b3ee2d91ed.ico',
            pinned: false,
          },
          {
            id: 3,
            title: 'Spotify - Web Player: Music for everyone',
            url: 'https://open.spotify.com/',
            favIconUrl: 'https://open.scdn.co/cdn/images/favicon.5cb2bd30.ico',
            pinned: false,
          },
        ],
      },
      {
        id: 2,
        name: 'Some other tabs',
        createdAt: new Date(2019, 5, 15, 23, 27),
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
      {
        id: 3,
        name: 'Some other tabs',
        createdAt: new Date(2019, 5, 15, 23, 27),
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
      {
        id: 4,
        name: 'Some other tabs',
        createdAt: new Date(2019, 5, 15, 23, 27),
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
      {
        id: 5,
        name: 'Some other tabs',
        createdAt: new Date(2019, 5, 15, 23, 27),
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
      {
        id: 6,
        name: 'Some other tabs',
        createdAt: new Date(2019, 5, 15, 23, 27),
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
      {
        id: 7,
        name: 'Some other tabs',
        createdAt: new Date(2019, 5, 15, 23, 27),
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
      {
        id: 8,
        name: 'Some other tabs',
        createdAt: new Date(2019, 5, 15, 23, 27),
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
      {
        id: 9,
        name: 'Some other tabs',
        createdAt: new Date(2019, 5, 15, 23, 27),
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
      {
        id: 10,
        name: 'Some other tabs',
        createdAt: new Date(2019, 5, 15, 23, 27),
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
      {
        id: 11,
        name: 'Some other tabs',
        createdAt: new Date(2019, 5, 15, 23, 27),
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
      {
        id: 12,
        name: 'Some other tabs',
        createdAt: new Date(2019, 5, 15, 23, 27),
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
      {
        id: 13,
        name: 'Some other tabs',
        createdAt: new Date(2019, 5, 15, 23, 27),
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
      {
        id: 14,
        name: 'Some other tabs',
        createdAt: new Date(2019, 5, 15, 23, 27),
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
      {
        id: 15,
        name: 'Some other tabs',
        createdAt: new Date(2019, 5, 15, 23, 27),
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
    return of(undefined);
  }

  public openTabListInNewWindow(): Task<void> {
    return of(undefined);
  }

  public deleteTabList(): Task<void> {
    return of(undefined);
  }

  public deleteTab(tabList: TabList): TaskOption<TabList> {
    return some(tabList);
  }
}
