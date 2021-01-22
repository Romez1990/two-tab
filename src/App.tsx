import React, { FC } from 'react';
import { Providers } from './components/Providers';
import { Router, RouterView } from './components/Router';
import { MainLayout } from './components/Layout';

export const App: FC = () => (
  <Providers>
    <Router>
      <MainLayout>
        <RouterView />
      </MainLayout>
    </Router>
  </Providers>
);
