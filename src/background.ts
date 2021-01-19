import { pipe } from 'fp-ts/function';
import { serviceContainer } from './services/ServiceContainer';
import { run } from './services/Utils/fp-ts/Task';

const logger = serviceContainer.get('loggerService');
const storage = serviceContainer.get('storageService');

pipe(
  logger.registerReceiver(),
  storage.connect.bind(storage),
  run,
  //
);
