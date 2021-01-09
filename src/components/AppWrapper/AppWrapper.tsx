import React, { FC } from 'react';
import { ServiceContainerProvider } from '../ServiceContainer';
import { ThemeProvider } from '../ThemeProvider';

export const AppWrapper: FC = ({ children }) => (
  <ServiceContainerProvider>
    <ThemeProvider>{children}</ThemeProvider>
  </ServiceContainerProvider>
);
