import { useContext } from 'react';
import { getService, ServiceContainer } from '../../../services/ServiceContainer';
import { ServiceContainerContext } from './ServiceContainerContext';
import { ServiceContainerNotProvidedError } from './Errors';

function useServiceContainer(): ServiceContainer {
  const serviceContainer = useContext(ServiceContainerContext);
  if (serviceContainer === null) throw new ServiceContainerNotProvidedError();
  return serviceContainer;
}

export function useService<T extends keyof ServiceContainer>(serviceName: T): NonNullable<ServiceContainer[T]> {
  const container = useServiceContainer();
  return getService(container, serviceName);
}
