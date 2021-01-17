import { AppError } from '../../Error';
import { TabList } from '../TabList';

export class TabListIdUndefinedError extends AppError {
  public constructor(public readonly tabList: TabList) {
    super('Cannot remove tab list with undefined id');
  }
}
