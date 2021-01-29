import { TabExportSerializer } from './TabExportSerializer';
import { ExportSerializedTab } from './ExportSerializedTab';
import { StoredTab } from '../../TabList/StoredTab';
import { StoredTabList } from '../../TabList/StoredTabList';
import { StoredTabToCreate } from '../../TabList/StoredTabToCreate';

export class TabExportSerializerImpl implements TabExportSerializer {
  public serialize = ({ id, tabListId, ...serializedTab }: StoredTab): ExportSerializedTab => serializedTab;

  public deserialize = ({ id }: StoredTabList) => (serializedTab: ExportSerializedTab): StoredTabToCreate => ({
    ...serializedTab,
    tabListId: id,
  });
}
