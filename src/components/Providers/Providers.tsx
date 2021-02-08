import React, { FC } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { ServiceContainerProvider } from './ServiceContainer';
import { ThemeProvider } from './ThemeProvider';
import { ServiceContainer } from '../../services/Infrastructure/ServiceContainer';

interface Props {
  readonly serviceContainer: ServiceContainer;
}

export const Providers: FC<Props> = ({ serviceContainer, children }) => (
  <ServiceContainerProvider serviceContainer={serviceContainer}>
    <ErrorBoundary>
      <ThemeProvider>{children}</ThemeProvider>
    </ErrorBoundary>
  </ServiceContainerProvider>
);
