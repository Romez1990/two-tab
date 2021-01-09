import { createContext } from 'react';
import { ServiceContainer } from './ServiceContainer';

export const ServiceContainerContext = createContext<ServiceContainer | null>(null);
