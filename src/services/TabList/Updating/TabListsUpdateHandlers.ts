import { TabList } from '../TabList';

export interface TabListsUpdateHandlers {
  add(tabList: TabList): void;
  update(tabList: TabList): void;
  delete(tabList: TabList): void;
}
