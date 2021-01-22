import { pipe } from 'fp-ts/function';
import { serviceContainer } from './services/Infrastructure/ServiceContainer';
import { run } from './services/Utils/fp-ts/Task';

const logger = serviceContainer.get('loggerService');
const storage = serviceContainer.get('storageService');

pipe(
  logger.registerAsReceiver(),
  storage.connect.bind(storage),
  run,
  //
);
