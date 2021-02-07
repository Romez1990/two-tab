import { ExportedTabList } from './ExportedTabList';
import { TabListEntity } from '../../TabList/TabListEntity';
import { TabEntity } from '../../TabList/TabEntity';
import { TabListEntityToCreate } from '../../TabList/TabListEntityToCreate';
import { TabEntityToCreate } from '../../TabList/TabEntityToCreate';

export interface TabListExportSerializer {
  serialize(
    tabListEntities: ReadonlyArray<TabListEntity>,
    tabEntities: ReadonlyArray<TabEntity>,
  ): ReadonlyArray<ExportedTabList>;
  deserialize(
    serializedTabLists: ReadonlyArray<ExportedTabList>,
  ): [
    ReadonlyArray<TabListEntityToCreate>,
    (tabListEntities: ReadonlyArray<TabListEntity>) => ReadonlyArray<TabEntityToCreate>,
  ];
}
