import { serviceContainer } from './services/ServiceContainer';
import { ConsoleLoggerDriver } from './services/Logger';

const loggerService = serviceContainer.get('loggerService');
const consoleLoggerDriver = new ConsoleLoggerDriver();

loggerService.registerDriver(consoleLoggerDriver);
