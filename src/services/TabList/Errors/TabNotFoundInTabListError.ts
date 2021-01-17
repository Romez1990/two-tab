import { AppError } from '../../Error';
import { TabList } from '../TabList';

export class TabNotFoundInTabListError extends AppError {
  public constructor(public readonly tabList: TabList) {
    super('Tab not found in tab list');
  }
}
