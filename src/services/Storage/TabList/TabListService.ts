import { ReadonlyNonEmptyArray } from 'fp-ts/ReadonlyNonEmptyArray';
import { Task } from 'fp-ts/Task';
import { TaskOption } from 'fp-ts-contrib/TaskOption';
import { TabListsUpdateHandlers } from './Updating';
import { TabList } from './TabList';
import { Tab } from './Tab';
import { TabToCreate } from './TabToCreate';

export interface TabListService {
  addUpdateHandlers(handlers: TabListsUpdateHandlers): void;
  removeUpdateHandlers(): void;
  getAll(): Task<ReadonlyArray<TabList>>;
  add(listName: string, tabs: ReadonlyNonEmptyArray<TabToCreate>): Task<TabList>;
  delete(tabList: TabList): Task<void>;
  deleteTab(tabList: TabList, tab: Tab): TaskOption<TabList>;
}
