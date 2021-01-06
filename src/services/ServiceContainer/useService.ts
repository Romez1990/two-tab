import { useContext } from 'react';
import { ExtensionService } from '../Extension';
import { TabService } from '../Tab';
import { ServiceContainer } from './ServiceContainer';
import { ServiceContainerContext } from './ServiceContainerContext';
import { ServiceContainerNotProvidedError, ServiceNotProvidedError } from './errors';

function useServiceContainer(): ServiceContainer {
  const serviceContainerContext = useContext(ServiceContainerContext);
  if (typeof serviceContainerContext === 'undefined') throw new ServiceContainerNotProvidedError();
  return serviceContainerContext;
}

export function useExtensionService(): ExtensionService {
  const { extensionService } = useServiceContainer();
  if (typeof extensionService === 'undefined') throw new ServiceNotProvidedError('ExtensionService');
  return extensionService;
}

export function useTabService(): TabService {
  const { tabService } = useServiceContainer();
  if (typeof tabService === 'undefined') throw new ServiceNotProvidedError('TabService');
  return tabService;
}
