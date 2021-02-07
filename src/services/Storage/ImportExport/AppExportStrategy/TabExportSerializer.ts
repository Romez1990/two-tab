import { ExportedTab } from './ExportedTab';
import { TabEntity } from '../../TabList/TabEntity';
import { TabListEntity } from '../../TabList/TabListEntity';
import { TabEntityToCreate } from '../../TabList/TabEntityToCreate';

export interface TabExportSerializer {
  serialize(tab: TabEntity): ExportedTab;
  deserialize(tabList: TabListEntity): (serializedTab: ExportedTab) => TabEntityToCreate;
}
