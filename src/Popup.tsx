import React, { FC } from 'react';
import { Providers } from './components/Providers';
import { PopupPanel } from './components/PopupPanel';

export const Popup: FC = () => (
  <Providers>
    <PopupPanel />
  </Providers>
);
