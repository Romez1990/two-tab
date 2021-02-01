import React, { FC } from 'react';
import { Providers } from './components/Providers';
import { PopupView } from './components/Popup';
import { AppServiceContainer } from './services/Infrastructure/ServiceContainer';

export const Popup: FC = () => {
  const serviceContainer = new AppServiceContainer();

  return (
    <Providers serviceContainer={serviceContainer}>
      <PopupView />
    </Providers>
  );
};
