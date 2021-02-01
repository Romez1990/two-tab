import { pipe } from 'fp-ts/function';
import { AppServiceContainer } from './services/Infrastructure/ServiceContainer';
import { run } from './services/Utils/fp-ts/Task';

const container = new AppServiceContainer();
const logger = container.get('loggerService');
const storage = container.get('storageService');

pipe(
  logger.registerAsReceiver(),
  storage.connect.bind(storage),
  run,
  //
);
