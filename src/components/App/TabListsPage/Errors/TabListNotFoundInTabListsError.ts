import { AppError } from '../../../../services/Error';
import { TabList } from '../../../../services/TabList';

export class TabListNotFoundInTabListsError extends AppError {
  public constructor(public readonly tabList: TabList) {
    super('Tab list not found in tab lists');
  }
}
