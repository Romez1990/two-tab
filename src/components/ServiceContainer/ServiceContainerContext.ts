import { createContext } from 'react';
import { ServiceContainer } from '../../services/ServiceContainer';

export const ServiceContainerContext = createContext<ServiceContainer | null>(null);
