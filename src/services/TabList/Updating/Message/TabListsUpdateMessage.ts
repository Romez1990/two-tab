import { BaseMessage } from '../../../MessageService';
import { TabListsUpdateType } from './TabListsUpdateType';
import { TabListsUpdateData } from './TabListsUpdateData';
import { SerializedTabList } from '../../TabListSerializer';

const messageType = 'tabListsUpdate';

export class TabListsUpdateMessage extends BaseMessage<typeof messageType, TabListsUpdateData> {
  public constructor(type: TabListsUpdateType, tabList: SerializedTabList) {
    super(messageType, { type, tabList });
  }
}
