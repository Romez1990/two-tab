import React, { FC } from 'react';
import { Providers } from './components/Providers';
import { PopupPanel } from './components/Popup';

export const Popup: FC = () => (
  <Providers>
    <PopupPanel />
  </Providers>
);
