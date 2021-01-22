import { AppError } from '../../../../services/Error';

export class ServiceContainerNotProvidedError extends AppError {
  public constructor() {
    super(`Service container was not provided`);
  }
}
