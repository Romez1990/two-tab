import { ServiceContainerError } from './ServiceContainerError';

export class ServiceContainerNotProvidedError extends ServiceContainerError {
  public constructor() {
    super(`service container was not provided`);
  }
}
