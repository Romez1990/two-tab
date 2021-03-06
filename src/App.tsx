import React, { FC } from 'react';
import { Providers } from './components/Providers';
import { Router, RouterView } from './components/App/Router';
import { MainLayout } from './components/App/Layout';
import { AppServiceContainer, BrowserServiceContainer } from './services/Infrastructure/ServiceContainer';

const isExtensionEnvironment = process.env.EXTENSION_ENVIRONMENT;

export const App: FC = () => {
  const serviceContainer = isExtensionEnvironment ? new AppServiceContainer() : new BrowserServiceContainer();

  return (
    <Providers serviceContainer={serviceContainer}>
      <Router>
        <MainLayout>
          <RouterView />
        </MainLayout>
      </Router>
    </Providers>
  );
};
