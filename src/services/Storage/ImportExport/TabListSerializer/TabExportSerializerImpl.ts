import { TabExportSerializer } from './TabExportSerializer';
import { ExportedTab } from './ExportedTab';
import { StoredTab } from '../../TabList/StoredTab';
import { StoredTabList } from '../../TabList/StoredTabList';
import { StoredTabToCreate } from '../../TabList/StoredTabToCreate';

export class TabExportSerializerImpl implements TabExportSerializer {
  public serialize = ({ id, tabListId, ...serializedTab }: StoredTab): ExportedTab => serializedTab;

  public deserialize = ({ id }: StoredTabList) => (serializedTab: ExportedTab): StoredTabToCreate => ({
    ...serializedTab,
    tabListId: id,
  });
}
