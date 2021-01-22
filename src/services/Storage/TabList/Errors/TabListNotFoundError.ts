import { AppError } from '../../../Infrastructure/Error';
import { TabList } from '../TabList';

export class TabListNotFoundError extends AppError {
  public constructor(public readonly tabList: TabList) {
    super('Tab list not found');
  }
}
