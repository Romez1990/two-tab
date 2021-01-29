import { StoredTabList } from './StoredTabList';
import { StoredTab } from './StoredTab';
import { TabList } from './TabList';

export interface TabListNormalizer {
  denormalize(
    storedTabLists: ReadonlyArray<StoredTabList>,
    storedTabs: ReadonlyArray<StoredTab>,
  ): ReadonlyArray<TabList>;
}
