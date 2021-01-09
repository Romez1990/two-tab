import { ServiceContainerError } from './ServiceContainerError';

export class ServiceContainerNotProvidedError extends ServiceContainerError {
  public constructor() {
    super(`Service container was not provided`);
  }
}
