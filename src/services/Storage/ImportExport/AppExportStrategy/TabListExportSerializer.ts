import { ExportedTabList } from './ExportedTabList';
import { StoredTabList } from '../../TabList/StoredTabList';
import { StoredTab } from '../../TabList/StoredTab';
import { StoredTabListToCreate } from '../../TabList/StoredTabListToCreate';
import { StoredTabToCreate } from '../../TabList/StoredTabToCreate';

export interface TabListExportSerializer {
  serialize(
    storedTabLists: ReadonlyArray<StoredTabList>,
    storedTabs: ReadonlyArray<StoredTab>,
  ): ReadonlyArray<ExportedTabList>;
  deserialize(
    serializedTabLists: ReadonlyArray<ExportedTabList>,
  ): [
    ReadonlyArray<StoredTabListToCreate>,
    (storedTabLists: ReadonlyArray<StoredTabList>) => ReadonlyArray<StoredTabToCreate>,
  ];
}
