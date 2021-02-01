import { AppError } from '../AppError';

export class NotImplementedError extends AppError {
  public constructor() {
    super('Not implemented');
  }
}
