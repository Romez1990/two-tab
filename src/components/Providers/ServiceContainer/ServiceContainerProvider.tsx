import React, { FC } from 'react';
import { ServiceContainer } from '../../../services/Infrastructure/ServiceContainer';
import { ServiceContainerContext } from './ServiceContainerContext';

interface Props {
  readonly serviceContainer: ServiceContainer;
}

export const ServiceContainerProvider: FC<Props> = ({ serviceContainer, children }) => (
  <ServiceContainerContext.Provider value={serviceContainer}>{children}</ServiceContainerContext.Provider>
);
