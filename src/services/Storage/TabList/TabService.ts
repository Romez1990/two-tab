import { ReadonlyNonEmptyArray } from 'fp-ts/ReadonlyNonEmptyArray';
import { Task } from 'fp-ts/Task';
import { TabListEntity } from './TabListEntity';
import { TabEntity } from './TabEntity';
import { Tab } from './Tab';
import { TabToCreate } from './TabToCreate';

export interface TabService {
  getAll(): Task<ReadonlyArray<TabEntity>>;
  addAll(tabListEntity: TabListEntity, tabs: ReadonlyNonEmptyArray<TabToCreate>): Task<ReadonlyNonEmptyArray<Tab>>;
  delete(tab: Tab): Task<void>;
  deleteAll(tabs: ReadonlyNonEmptyArray<Tab>): Task<void>;
}
