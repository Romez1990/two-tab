import { TabList } from '../TabList';
import { SerializedTabList } from './SerializedTabList';

export interface TabListSerializer {
  serialize(tabList: TabList): SerializedTabList;
  deserialize(serializedTabList: SerializedTabList): TabList;
}
