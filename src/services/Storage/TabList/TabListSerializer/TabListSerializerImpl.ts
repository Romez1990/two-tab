import { SerializedTabList } from './SerializedTabList';
import { TabList } from '../TabList';
import { TabListSerializer } from './TabListSerializer';
import { DatetimeService } from '../../../DataProcessing/Datetime';

export class TabListSerializerImpl implements TabListSerializer {
  public constructor(private readonly datetimeService: DatetimeService) {}

  public serialize = ({ createdAt, ...tabList }: TabList): SerializedTabList => ({
    ...tabList,
    createdAtTimestamp: this.datetimeService.toTimeStamp(createdAt),
  });

  public deserialize = ({ createdAtTimestamp, ...serializedTabList }: SerializedTabList): TabList => ({
    ...serializedTabList,
    createdAt: this.datetimeService.fromTimeStamp(createdAtTimestamp),
  });
}
