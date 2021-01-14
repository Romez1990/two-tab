import React, { FC } from 'react';
import { AppWrapper } from './components/AppWrapper';
import { MainPage } from './components/MainPage';

export const App: FC = () => (
  <AppWrapper>
    <MainPage />
  </AppWrapper>
);
