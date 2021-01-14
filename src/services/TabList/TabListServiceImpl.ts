import { pipe } from 'fp-ts/function';
import { ReadonlyNonEmptyArray } from 'fp-ts/ReadonlyNonEmptyArray';
import { Task } from 'fp-ts/Task';
import { DateService } from '../Date';
import { TabList } from './TabList';
import { TabListService } from './TabListService';
import { TabListRepository } from './TabListRepository';
import { Tab } from './Tab';

export class TabListServiceImpl implements TabListService {
  public constructor(
    private readonly tabListRepository: TabListRepository,
    private readonly dateService: DateService,
  ) {}

  public getAll = (): Task<ReadonlyArray<TabList>> => this.tabListRepository.getAll();

  public save = (listName: string, tabs: ReadonlyNonEmptyArray<Tab>): Task<TabList> =>
    pipe(this.createTabList(listName, tabs), this.tabListRepository.save.bind(this.tabListRepository));

  private createTabList = (name: string, tabs: ReadonlyNonEmptyArray<Tab>): TabList => ({
    name,
    date: this.dateService.getCurrentDate(),
    tabs,
  });
}
