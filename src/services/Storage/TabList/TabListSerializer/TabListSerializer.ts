import { SerializedTabList } from './SerializedTabList';
import { StoredTabList } from '../StoredTabList';
import { StoredTab } from '../StoredTab';
import { StoredTabListToCreate } from '../StoredTabListToCreate';
import { StoredTabToCreate } from '../StoredTabToCreate';

export interface TabListSerializer {
  serialize(
    storedTabLists: ReadonlyArray<StoredTabList>,
    storedTabs: ReadonlyArray<StoredTab>,
  ): ReadonlyArray<SerializedTabList>;
  deserialize(
    serializedTabLists: ReadonlyArray<SerializedTabList>,
  ): [
    ReadonlyArray<StoredTabListToCreate>,
    (storedTabLists: ReadonlyArray<StoredTabList>) => ReadonlyArray<StoredTabToCreate>,
  ];
}
