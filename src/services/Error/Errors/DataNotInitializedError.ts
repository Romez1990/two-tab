import { AppError } from '../AppError';

export abstract class DataNotInitializedError extends AppError {
  protected constructor(dataName: string) {
    super(`Cannot process ${dataName} before initializing`);
  }
}
