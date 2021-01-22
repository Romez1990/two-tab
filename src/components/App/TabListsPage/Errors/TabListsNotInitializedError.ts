import { DataNotInitializedError } from '../../../../services/Error';

export class TabListsNotInitializedError extends DataNotInitializedError {
  public constructor() {
    super('tab lists');
  }
}
