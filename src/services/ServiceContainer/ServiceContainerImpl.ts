import { PopupService, PopupServiceImpl } from '../Popup';
import { ExtensionService, ChromeExtensionService } from '../Extension';
import { TabService, TabServiceImpl, BrowserTabService, ChromeTabService } from '../Tab';
import { KeyPressingService, KeyPressingServiceImpl } from '../KeyPressingService';
import { ErrorReportingService, ErrorReportingServiceImpl } from '../ErrorReporting';
import {
  LoggerService,
  LoggerServiceImpl,
  LoggerDriver,
  ConsoleLoggerDriver,
  LoggerStateFactory,
  LoggerStateFactoryImpl,
} from '../Logger';
import { MessageService, MessageServiceImpl, MessageSender, ChromeMessageSender } from '../MessageService';
import { Config, ConfigImpl } from '../Config';
import { EnvService, EnvServiceImpl, EnvDriver, EnvDriverImpl } from '../Env';
import { TypeCheckingService, TypeCheckingServiceImpl, ErrorReporter, ErrorReporterImpl } from '../TypeChecking';
import { ServiceContainer } from './ServiceContainer';
import { ServiceNotProvidedError } from './Errors';
import { JsonSerializer, JsonSerializerImpl } from '../Serializer';
import { ErrorProcessingService, ErrorProcessingServiceImpl } from '../Error';

class ServiceContainerImpl implements ServiceContainer {
  public constructor() {
    this.jsonSerializer = new JsonSerializerImpl(JSON);

    this.errorReporter = new ErrorReporterImpl();
    this.typeCheckingService = new TypeCheckingServiceImpl(this.errorReporter);

    this.envDriver = new EnvDriverImpl(process.env);
    this.envService = new EnvServiceImpl(this.envDriver, this.typeCheckingService);

    this.config = new ConfigImpl(this.envService);

    this.messageSender = new ChromeMessageSender();
    this.messageService = new MessageServiceImpl(this.messageSender, this.typeCheckingService);

    this.loggerDriver = new ConsoleLoggerDriver(console);
    this.loggerStateFactory = new LoggerStateFactoryImpl(this.messageService, this.loggerDriver);
    this.loggerService = new LoggerServiceImpl(this.loggerStateFactory);

    this.errorProcessingService = new ErrorProcessingServiceImpl(this.jsonSerializer);

    this.errorReportingService = new ErrorReportingServiceImpl(
      this.config,
      this.errorProcessingService,
      this.loggerService,
    );

    this.keyPressingService = new KeyPressingServiceImpl(window);

    this.extensionService = new ChromeExtensionService();

    this.browserTabService = new ChromeTabService();
    this.tabService = new TabServiceImpl(this.browserTabService, this.extensionService);

    this.popupService = new PopupServiceImpl(this.extensionService, this.tabService);
  }

  public readonly popupService: PopupService;

  public readonly extensionService: ExtensionService;

  public readonly tabService: TabService;
  public readonly browserTabService: BrowserTabService;

  public readonly keyPressingService: KeyPressingService;

  public readonly errorReportingService: ErrorReportingService;

  public readonly errorProcessingService: ErrorProcessingService;

  public readonly loggerService: LoggerService;
  public readonly loggerStateFactory: LoggerStateFactory;
  public readonly loggerDriver: LoggerDriver;

  public readonly messageService: MessageService;
  public readonly messageSender: MessageSender;

  public readonly config: Config;

  public readonly envService: EnvService;
  public readonly envDriver: EnvDriver;

  public readonly typeCheckingService: TypeCheckingService;
  public readonly errorReporter: ErrorReporter;

  public readonly jsonSerializer: JsonSerializer;

  public get<T extends keyof ServiceContainer>(serviceName: T): NonNullable<ServiceContainer[T]> {
    const service = this[serviceName];
    if (service === null) throw new ServiceNotProvidedError('name');
    return service as NonNullable<ServiceContainer[T]>;
  }
}

export const serviceContainer = new ServiceContainerImpl();
