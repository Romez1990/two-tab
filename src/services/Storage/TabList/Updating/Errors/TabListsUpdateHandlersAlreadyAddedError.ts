import { AppError } from '../../../../Infrastructure/Error';

export class TabListsUpdateHandlersAlreadyAddedError extends AppError {
  public constructor() {
    super('Tab lists update handlers are already added');
  }
}
