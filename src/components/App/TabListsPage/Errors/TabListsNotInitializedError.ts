import { DataNotInitializedError } from '../../../../services/Infrastructure/Error';

export class TabListsNotInitializedError extends DataNotInitializedError {
  public constructor() {
    super('tab lists');
  }
}
