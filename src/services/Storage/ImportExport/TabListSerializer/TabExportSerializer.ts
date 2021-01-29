import { ExportSerializedTab } from './ExportSerializedTab';
import { StoredTab } from '../../TabList/StoredTab';
import { StoredTabList } from '../../TabList/StoredTabList';
import { StoredTabToCreate } from '../../TabList/StoredTabToCreate';

export interface TabExportSerializer {
  serialize(tab: StoredTab): ExportSerializedTab;
  deserialize(tabList: StoredTabList): (serializedTab: ExportSerializedTab) => StoredTabToCreate;
}
