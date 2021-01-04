import { ServiceContainerError } from './ServiceContainerError';

export class ServiceNotProvidedError extends ServiceContainerError {
  public constructor(service: string) {
    super(`service ${service} was not provided`);
  }
}
