import { AppError } from '../../../services/Error';

export class TabListsNotInitializedError extends AppError {
  public constructor() {
    super('Tab lists is not initialized');
  }
}
