import { serviceContainer } from './services/ServiceContainer';

const loggerService = serviceContainer.get('loggerService');

loggerService.registerReceiver();
