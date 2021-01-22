import { SerializedTabList } from '../../TabListSerializer';
import { TabListsUpdateType } from './TabListsUpdateType';

export interface TabListsUpdateData {
  readonly type: TabListsUpdateType;
  readonly tabList: SerializedTabList;
}
