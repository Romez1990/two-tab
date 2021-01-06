import { ServiceContainerError } from './ServiceContainerError';

export class ServiceNotProvidedError extends ServiceContainerError {
  public constructor(service: string) {
    super(`Service ${service} was not provided`);
  }
}
