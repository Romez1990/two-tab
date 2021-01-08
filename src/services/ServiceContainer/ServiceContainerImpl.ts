import { ExtensionService, ChromeExtensionService } from '../Extension';
import { TabService, TabServiceImpl, BrowserTabService, ChromeTabService } from '../Tab';
import { LoggerService, LoggerServiceImpl, LoggerDriver, ConsoleLoggerDriver } from '../Logger';
import { ServiceNotProvidedError } from './Errors';
import { ServiceContainer } from './ServiceContainer';
import { MessageService, MessageServiceImpl, MessageSender, ChromeMessageSender } from '../MessageService';
import { KeyPressingService, KeyPressingServiceImpl } from '../KeyPressingService';
import { TypeCheckingService, TypeCheckingServiceImpl, ErrorReporter, ErrorReporterImpl } from '../TypeChecking';

class ServiceContainerImpl implements ServiceContainer {
  public constructor() {
    this.errorReporter = new ErrorReporterImpl();
    this.typeCheckingService = new TypeCheckingServiceImpl(this.errorReporter);

    this.keyPressingService = new KeyPressingServiceImpl(window);

    this.messageSender = new ChromeMessageSender();
    this.messageService = new MessageServiceImpl(this.messageSender, this.typeCheckingService);

    this.loggerDriver = new ConsoleLoggerDriver();
    this.loggerService = new LoggerServiceImpl(this.loggerDriver, this.messageService);

    this.extensionService = new ChromeExtensionService();

    this.browserTabService = new ChromeTabService(this.loggerService);
    this.tabService = new TabServiceImpl(this.browserTabService, this.extensionService);
  }

  public readonly extensionService: ExtensionService;

  public readonly tabService: TabService;
  public readonly browserTabService: BrowserTabService;

  public readonly loggerService: LoggerService;
  public readonly loggerDriver: LoggerDriver;

  public readonly messageService: MessageService;
  public readonly messageSender: MessageSender;

  public readonly keyPressingService: KeyPressingService;

  public readonly typeCheckingService: TypeCheckingService;
  public readonly errorReporter: ErrorReporter;

  public get<T extends keyof ServiceContainer>(serviceName: T): NonNullable<ServiceContainer[T]> {
    const service = this[serviceName];
    if (service === null) throw new ServiceNotProvidedError('name');
    return service as NonNullable<ServiceContainer[T]>;
  }
}

export const serviceContainer = new ServiceContainerImpl();
