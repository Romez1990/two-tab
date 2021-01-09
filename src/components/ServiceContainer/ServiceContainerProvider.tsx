import React, { FC } from 'react';
import {
  ServiceContainer,
  serviceContainer as serviceContainerDefault,
  ServiceContainerContext,
} from '../../services/ServiceContainer';

interface Props {
  readonly serviceContainer?: ServiceContainer;
}

export const ServiceContainerProvider: FC<Props> = ({ serviceContainer = serviceContainerDefault, children }) => (
  <ServiceContainerContext.Provider value={serviceContainer}>{children}</ServiceContainerContext.Provider>
);
