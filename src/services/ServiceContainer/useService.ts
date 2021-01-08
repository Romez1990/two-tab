import { useContext } from 'react';
import { ServiceContainer } from './ServiceContainer';
import { ServiceContainerContext } from './ServiceContainerContext';
import { ServiceContainerNotProvidedError, ServiceNotProvidedError } from './Errors';

function useServiceContainer(): ServiceContainer {
  const serviceContainer = useContext(ServiceContainerContext);
  if (serviceContainer === null) throw new ServiceContainerNotProvidedError();
  return serviceContainer;
}

export function useService<T extends keyof ServiceContainer>(name: T): NonNullable<ServiceContainer[T]> {
  const serviceContainer = useServiceContainer();
  const service = serviceContainer[name];
  if (typeof service === 'undefined') throw new ServiceNotProvidedError(name);
  return service as NonNullable<ServiceContainer[T]>;
}
