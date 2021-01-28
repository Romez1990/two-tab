import { StoredTabToCreate } from '../StoredTabToCreate';
import { TabSerializer } from './TabSerializer';
import { SerializedTab } from './SerializedTab';
import { StoredTab } from '../StoredTab';
import { StoredTabList } from '../StoredTabList';

export class TabSerializerImpl implements TabSerializer {
  public serialize = ({ id, ...serializedTab }: StoredTab): SerializedTab => serializedTab;

  public deserialize = ({ id }: StoredTabList) => (serializedTab: SerializedTab): StoredTabToCreate => ({
    ...serializedTab,
    tabListId: id,
  });
}
