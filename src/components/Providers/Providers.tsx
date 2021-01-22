import React, { FC } from 'react';
import { ErrorBoundary } from '../ErrorBoundary';
import { ServiceContainerProvider } from '../ServiceContainer';
import { ThemeProvider } from '../ThemeProvider';
import { StorageConnector } from '../Storage';

export const Providers: FC = ({ children }) => (
  <ServiceContainerProvider>
    <ErrorBoundary>
      <ThemeProvider>
        <StorageConnector>{children}</StorageConnector>
      </ThemeProvider>
    </ErrorBoundary>
  </ServiceContainerProvider>
);
