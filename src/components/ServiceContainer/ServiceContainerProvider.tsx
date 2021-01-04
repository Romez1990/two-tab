import React, { FC } from 'react';
import { ServiceContainerContext } from './ServiceContainerContext';
import { serviceContainer } from './ServiceContainer';

export const ServiceContainerProvider: FC = ({ children }) => (
  <ServiceContainerContext.Provider value={serviceContainer}>{children}</ServiceContainerContext.Provider>
);
