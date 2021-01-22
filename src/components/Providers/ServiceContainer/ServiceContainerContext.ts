import { createContext } from 'react';
import { ServiceContainer } from '../../../services/Infrastructure/ServiceContainer';

export const ServiceContainerContext = createContext<ServiceContainer | null>(null);
