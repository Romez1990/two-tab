import React, { FC } from 'react';
import { ServiceContainerProvider } from '../ServiceContainer';

export const AppWrapper: FC = ({ children }) => <ServiceContainerProvider>{children} </ServiceContainerProvider>;
