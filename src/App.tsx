import React, { FC } from 'react';
import { Providers } from './components/Providers';
import { Router, RouterView } from './components/App/Router';
import { MainLayout } from './components/App/Layout';

export const App: FC = () => (
  <Providers>
    <Router>
      <MainLayout>
        <RouterView />
      </MainLayout>
    </Router>
  </Providers>
);
