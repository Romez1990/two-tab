import { ExportedTab } from './ExportedTab';
import { StoredTab } from '../../TabList/StoredTab';
import { StoredTabList } from '../../TabList/StoredTabList';
import { StoredTabToCreate } from '../../TabList/StoredTabToCreate';

export interface TabExportSerializer {
  serialize(tab: StoredTab): ExportedTab;
  deserialize(tabList: StoredTabList): (serializedTab: ExportedTab) => StoredTabToCreate;
}
