import { pipe } from 'fp-ts/function';
import { ServiceContainerImpl } from './services/Infrastructure/ServiceContainer';
import { run } from './services/Utils/fp-ts/Task';

const container = new ServiceContainerImpl();
const logger = container.get('loggerService');
const storage = container.get('storageService');

pipe(
  logger.registerAsReceiver(),
  storage.connect.bind(storage),
  run,
  //
);
