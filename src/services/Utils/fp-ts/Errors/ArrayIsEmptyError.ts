import { AppError } from '../../../Infrastructure/Error';

export class ArrayIsEmptyError extends AppError {
  public constructor(itemsName: string) {
    super(`Array of ${itemsName} must not be empty`);
  }
}
