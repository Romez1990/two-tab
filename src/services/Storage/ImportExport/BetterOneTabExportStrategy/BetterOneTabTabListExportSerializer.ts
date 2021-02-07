import { TabListEntity } from '../../TabList/TabListEntity';
import { TabEntity } from '../../TabList/TabEntity';
import { TabListEntityToCreate } from '../../TabList/TabListEntityToCreate';
import { TabEntityToCreate } from '../../TabList/TabEntityToCreate';
import { BetterOneTabExportedTabList } from './BetterOneTabExportedTabList';

export interface BetterOneTabTabListExportSerializer {
  serialize(
    tabListEntities: ReadonlyArray<TabListEntity>,
    tabEntities: ReadonlyArray<TabEntity>,
  ): ReadonlyArray<BetterOneTabExportedTabList>;
  deserialize(
    serializedTabLists: ReadonlyArray<BetterOneTabExportedTabList>,
  ): [
    ReadonlyArray<TabListEntityToCreate>,
    (tabListEntities: ReadonlyArray<TabListEntity>) => ReadonlyArray<TabEntityToCreate>,
  ];
}
