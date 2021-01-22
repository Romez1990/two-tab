import { SerializedTabList } from './SerializedTabList';
import { TabList } from '../TabList';
import { TabListSerializer } from './TabListSerializer';
import { DatetimeService } from '../../Datetime';

export class TabListSerializerImpl implements TabListSerializer {
  public constructor(private readonly datetimeService: DatetimeService) {}

  public serialize = ({ id, name, createdAt, tabs }: TabList): SerializedTabList => ({
    id,
    name,
    createdAtTimestamp: this.datetimeService.toTimeStamp(createdAt),
    tabs,
  });

  public deserialize = ({ id, name, createdAtTimestamp, tabs }: SerializedTabList): TabList => ({
    id,
    name,
    createdAt: this.datetimeService.fromTimeStamp(createdAtTimestamp),
    tabs,
  });
}
