import { DataNotInitializedError } from '../../../services/Infrastructure/Error';

export class TabsNotInitializedError extends DataNotInitializedError {
  public constructor() {
    super('tabs');
  }
}
