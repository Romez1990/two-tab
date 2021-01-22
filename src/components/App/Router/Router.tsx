import React, { FC } from 'react';
import { HashRouter } from 'react-router-dom';

export const Router: FC = ({ children }) => <HashRouter>{children}</HashRouter>;
