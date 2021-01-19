import { pipe } from 'fp-ts/function';
import { serviceContainer } from './services/ServiceContainer';
import { run } from './services/Utils/fp-ts/Task';

const loggerService = serviceContainer.get('loggerService');
const storageService = serviceContainer.get('storageService');

pipe(
  loggerService.registerReceiver(),
  storageService.connect.bind(storageService),
  run,
  //
);
