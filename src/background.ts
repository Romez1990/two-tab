import { serviceContainer } from './services/ServiceContainer';
import { run } from './services/Utils/fp-ts/Task';

async function main(): Promise<void> {
  const loggerService = serviceContainer.get('loggerService');
  const storageService = serviceContainer.get('storageService');

  loggerService.registerReceiver();
  await run(storageService.connect());
}

main();
