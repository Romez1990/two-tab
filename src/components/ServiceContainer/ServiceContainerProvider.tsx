import React, { FC } from 'react';
import { ServiceContainerContext } from './ServiceContainerContext';
import { ServiceContainer, serviceContainer as serviceContainerDefault } from './ServiceContainer';

interface Props {
  serviceContainer?: ServiceContainer;
}

export const ServiceContainerProvider: FC<Props> = ({ serviceContainer = serviceContainerDefault, children }) => (
  <ServiceContainerContext.Provider value={serviceContainer}>{children}</ServiceContainerContext.Provider>
);
