import { StoredTab } from '../StoredTab';
import { StoredTabToCreate } from '../StoredTabToCreate';
import { SerializedTab } from './SerializedTab';
import { StoredTabList } from '../StoredTabList';

export interface TabSerializer {
  serialize(tab: StoredTab): SerializedTab;
  deserialize(tabList: StoredTabList): (serializedTab: SerializedTab) => StoredTabToCreate;
}
