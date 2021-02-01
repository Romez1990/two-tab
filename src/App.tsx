import React, { FC } from 'react';
import { Providers } from './components/Providers';
import { Router, RouterView } from './components/App/Router';
import { MainLayout } from './components/App/Layout';
import { AppServiceContainer } from './services/Infrastructure/ServiceContainer';

export const App: FC = () => {
  const serviceContainer = new AppServiceContainer();

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
