import React, { FC } from 'react';
import { Providers } from './components/Providers';
import { Router, RouterView } from './components/App/Router';
import { MainLayout } from './components/App/Layout';
import { ServiceContainerImpl } from './services/Infrastructure/ServiceContainer';

export const App: FC = () => {
  const serviceContainer = new ServiceContainerImpl();

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
