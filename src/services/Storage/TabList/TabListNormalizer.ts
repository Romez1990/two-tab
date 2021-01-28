import { StoredTabList } from './StoredTabList';
import { StoredTab } from './StoredTab';
import { TabList } from './TabList';
import { StoredTabListToCreate } from './StoredTabListToCreate';

export interface TabListNormalizer {
  denormalize(
    storedTabLists: ReadonlyArray<StoredTabList>,
    storedTabs: ReadonlyArray<StoredTab>,
  ): ReadonlyArray<TabList>;
  normalize(
    storedTabListsToCreate: ReadonlyArray<StoredTabListToCreate>,
  ): [ReadonlyArray<StoredTabListToCreate>, ReadonlyArray<StoredTab>];
}
