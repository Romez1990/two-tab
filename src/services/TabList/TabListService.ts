import { ReadonlyNonEmptyArray } from 'fp-ts/ReadonlyNonEmptyArray';
import { Task } from 'fp-ts/Task';
import { TabList } from './TabList';
import { Tab } from './Tab';

export interface TabListService {
  getAll(): Task<ReadonlyArray<TabList>>;
  save(listName: string, tabs: ReadonlyNonEmptyArray<Tab>): Task<TabList>;
}
