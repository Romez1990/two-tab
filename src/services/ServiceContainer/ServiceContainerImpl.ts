import { ExtensionService, ChromeExtensionService } from '../Extension';
import { TabService, TabServiceImpl, BrowserTabService, ChromeTabService } from '../Tab';
import { LoggerService, LoggerServiceImpl, LoggerDriver, ConsoleLoggerDriver } from '../Logger';
import { ServiceNotProvidedError } from './errors';
import { ServiceContainer } from './ServiceContainer';
import { MessageService, MessageServiceImpl, ChromeConnectionFactory, ConnectionFactory } from '../MessageService';

class ServiceContainerImpl implements ServiceContainer {
  public constructor() {
    this.connectionFactory = new ChromeConnectionFactory();
    this.messageService = new MessageServiceImpl(this.connectionFactory);

    this.loggerDriver = new ConsoleLoggerDriver();
    this.loggerService = new LoggerServiceImpl(this.loggerDriver, this.messageService);

    this.extensionService = new ChromeExtensionService();

    this.browserTabService = new ChromeTabService();
    this.tabService = new TabServiceImpl(this.browserTabService, this.extensionService);
  }

  public readonly extensionService: ExtensionService;

  public readonly tabService: TabService;
  public readonly browserTabService: BrowserTabService;

  public readonly loggerService: LoggerService;
  public readonly loggerDriver: LoggerDriver;

  public readonly messageService: MessageService;
  public readonly connectionFactory: ConnectionFactory;

  public get<T extends keyof ServiceContainer>(serviceName: T): NonNullable<ServiceContainer[T]> {
    const service = this[serviceName];
    if (service === null) throw new ServiceNotProvidedError('name');
    return service as NonNullable<ServiceContainer[T]>;
  }
}

export const serviceContainer = new ServiceContainerImpl();
