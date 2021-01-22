import { AppError } from '../../Error';

export class EnvironmentError extends AppError {
  public constructor(public readonly varName: string, message: string) {
    super(message);
  }
}
