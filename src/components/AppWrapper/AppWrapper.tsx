import React, { FC } from 'react';
import { ErrorBoundary } from '../ErrorBoundary';
import { ServiceContainerProvider } from '../ServiceContainer';
import { ThemeProvider } from '../ThemeProvider';

export const AppWrapper: FC = ({ children }) => (
  <ServiceContainerProvider>
    <ErrorBoundary>
      <ThemeProvider>{children}</ThemeProvider>
    </ErrorBoundary>
  </ServiceContainerProvider>
);
