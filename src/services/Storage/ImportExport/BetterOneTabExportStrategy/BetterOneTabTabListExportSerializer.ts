import { StoredTabList } from '../../TabList/StoredTabList';
import { StoredTab } from '../../TabList/StoredTab';
import { StoredTabListToCreate } from '../../TabList/StoredTabListToCreate';
import { StoredTabToCreate } from '../../TabList/StoredTabToCreate';
import { BetterOneTabExportedTabList } from './BetterOneTabExportedTabList';

export interface BetterOneTabTabListExportSerializer {
  serialize(
    storedTabLists: ReadonlyArray<StoredTabList>,
    storedTabs: ReadonlyArray<StoredTab>,
  ): ReadonlyArray<BetterOneTabExportedTabList>;
  deserialize(
    serializedTabLists: ReadonlyArray<BetterOneTabExportedTabList>,
  ): [
    ReadonlyArray<StoredTabListToCreate>,
    (storedTabLists: ReadonlyArray<StoredTabList>) => ReadonlyArray<StoredTabToCreate>,
  ];
}
