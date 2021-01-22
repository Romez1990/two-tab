import { AppError } from '../../../../services/Infrastructure/Error';
import { TabList } from '../../../../services/Storage/TabList';

export class TabListNotFoundInTabListsError extends AppError {
  public constructor(public readonly tabList: TabList) {
    super('Tab list not found in tab lists');
  }
}
