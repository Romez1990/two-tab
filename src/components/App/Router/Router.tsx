import React, { FC } from 'react';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import { useService } from '../../Providers/ServiceContainer';

export const Router: FC = ({ children }) => {
  const { isExtensionEnvironment } = useService('config');

  return isExtensionEnvironment ? <HashRouter>{children}</HashRouter> : <BrowserRouter>{children}</BrowserRouter>;
};
