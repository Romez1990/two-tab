import { Task } from 'fp-ts/Task';
import { TabList } from './TabList';
import { TabListService } from './TabListService';
import { TabListRepository } from './TabListRepository';

export class TabListServiceImpl implements TabListService {
  public constructor(private readonly tabListRepository: TabListRepository) {}

  public getAll = (): Task<ReadonlyArray<TabList>> => this.tabListRepository.getAll();

  public save = (tabList: TabList): Task<TabList> => this.tabListRepository.save(tabList);
}
