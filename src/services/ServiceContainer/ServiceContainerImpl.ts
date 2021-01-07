import { ExtensionService, ExtensionServiceImpl } from '../Extension';
import { TabService, TabServiceImpl, BrowserTabService, ChromeTabService } from '../Tab';
import { LoggerService, LoggerServiceImpl } from '../Logger';
import { ServiceNotProvidedError } from './errors';
import { ServiceContainer } from './ServiceContainer';

class ServiceContainerImpl implements ServiceContainer {
  public constructor() {
    this.loggerService = new LoggerServiceImpl();

    this.extensionService = new ExtensionServiceImpl();

    this.browserTabService = new ChromeTabService();
    this.tabService = new TabServiceImpl(this.browserTabService, this.extensionService);
  }

  public readonly extensionService?: ExtensionService;

  public readonly tabService?: TabService;
  public readonly browserTabService?: BrowserTabService;

  public readonly loggerService?: LoggerService;

  public get<T extends keyof ServiceContainer>(serviceName: T): NonNullable<ServiceContainer[T]> {
    const service = this[serviceName];
    if (service === null) throw new ServiceNotProvidedError('name');
    return service as NonNullable<ServiceContainer[T]>;
  }
}

export const serviceContainer = new ServiceContainerImpl();
