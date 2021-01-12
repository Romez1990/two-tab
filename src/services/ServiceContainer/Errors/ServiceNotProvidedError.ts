import { AppError } from '../../Error';

export class ServiceNotProvidedError extends AppError {
  public constructor(service: string) {
    super(`Service ${service} was not provided`);
  }
}
