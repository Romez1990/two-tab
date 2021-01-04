import { createContext } from 'react';
import { serviceContainer } from './ServiceContainer';

export const ServiceContainerContext = createContext<typeof serviceContainer | undefined>(undefined);
