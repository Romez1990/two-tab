import { DataNotInitializedError } from '../../../services/Error';

export class TabsNotInitializedError extends DataNotInitializedError {
  public constructor() {
    super('tabs');
  }
}
