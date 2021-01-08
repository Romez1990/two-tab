import { AppError } from '../Error';

export class TypeCheckingError extends AppError {
  public constructor(public readonly data: unknown, public readonly messages: ReadonlyArray<string>) {
    super('Type checking failed');
  }
}
