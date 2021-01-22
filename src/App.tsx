import React, { FC } from 'react';
import { AppWrapper } from './components/AppWrapper';
import { Router, RouterView } from './components/Router';
import { MainLayout } from './components/Layout';

export const App: FC = () => (
  <AppWrapper>
    <Router>
      <MainLayout>
        <RouterView />
      </MainLayout>
    </Router>
  </AppWrapper>
);
