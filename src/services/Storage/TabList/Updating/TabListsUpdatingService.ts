import { TabList } from '../TabList';
import { TabListsUpdateHandlers } from './TabListsUpdateHandlers';

export interface TabListsUpdatingService {
  addHandlers(handlers: TabListsUpdateHandlers): void;
  removeHandlers(): void;
  addTabList(tabList: TabList): void;
  updateTabList(tabList: TabList): void;
  deleteTabList(tabList: TabList): void;
}
