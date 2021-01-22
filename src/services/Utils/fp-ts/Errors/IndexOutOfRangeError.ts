import { AppError } from '../../../Error';

export class IndexOutOfRangeError extends AppError {
  public constructor(public readonly index: number, public readonly array: ReadonlyArray<unknown>) {
    super(`Index ${index} is outside the bounds of the array`);
  }
}
