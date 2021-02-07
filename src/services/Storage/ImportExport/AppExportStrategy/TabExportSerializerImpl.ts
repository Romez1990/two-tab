import { TabExportSerializer } from './TabExportSerializer';
import { ExportedTab } from './ExportedTab';
import { TabEntity } from '../../TabList/TabEntity';
import { TabListEntity } from '../../TabList/TabListEntity';
import { TabEntityToCreate } from '../../TabList/TabEntityToCreate';

export class TabExportSerializerImpl implements TabExportSerializer {
  public serialize = ({ id, tabListId, ...serializedTab }: TabEntity): ExportedTab => serializedTab;

  public deserialize = ({ id }: TabListEntity) => (serializedTab: ExportedTab): TabEntityToCreate => ({
    ...serializedTab,
    tabListId: id,
  });
}
