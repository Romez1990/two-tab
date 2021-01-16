import { Table } from 'dexie';
import { pipe, constant } from 'fp-ts/function';
import { Task, map } from 'fp-ts/Task';
import { StorageService } from '../Storage';
import { TabListRepository } from './TabListRepository';
import { idLens, TabList } from './TabList';

export class TabListRepositoryImpl implements TabListRepository {
  public constructor(private readonly storage: StorageService) {
    storage.addTable(this.tableName, '++id, data');
  }

  private readonly tableName = 'tabLists';

  private get table(): Table<TabList, number> {
    return this.storage.getTable(this.tableName);
  }

  public getAllTabLists = (): Task<ReadonlyArray<TabList>> => () => this.table.reverse().sortBy('key');

  public saveTabList = (tabList: TabList): Task<TabList> =>
    pipe(
      () => this.table.add(tabList),
      map(id => idLens.modify(constant(id))(tabList)),
    );
}
