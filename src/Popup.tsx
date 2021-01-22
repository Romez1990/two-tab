import React, { FC } from 'react';
import { Providers } from './components/Providers';
import { PopupView } from './components/Popup';

export const Popup: FC = () => (
  <Providers>
    <PopupView />
  </Providers>
);
