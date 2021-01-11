import { PopupService, PopupServiceImpl } from '../Popup';
import { TabListService, TabListServiceImpl, TabListRepository, TabListRepositoryImpl } from '../TabList';
import { StorageService, StorageServiceImpl } from '../Storage';
import { ExtensionService, ChromeExtensionService } from '../Extension';
import { TabService, TabServiceImpl, BrowserTabService, ChromeTabService } from '../BrowserTab';
import { KeyPressingService, KeyPressingServiceImpl } from '../KeyPressingService';
import { ErrorReportingService, ErrorReportingServiceImpl } from '../ErrorReporting';
import {
  LoggerService,
  LoggerServiceImpl,
  LoggerHandler,
  ConsoleLoggerHandler,
  LoggerStateFactory,
  LoggerStateFactoryImpl,
} from '../Logger';
import { MessageService, MessageServiceImpl, MessageSender, ChromeMessageSender } from '../MessageService';
import { Config, ConfigImpl } from '../Config';
import { EnvService, EnvServiceImpl } from '../Env';
import { TypeCheckingService, TypeCheckingServiceImpl, ErrorReporter, ErrorReporterImpl } from '../TypeChecking';
import { ServiceContainer } from './ServiceContainer';
import { ServiceNotProvidedError } from './Errors';
import { JsonSerializer, JsonSerializerImpl } from '../Serializer';
import { ErrorProcessingService, ErrorProcessingServiceImpl } from '../Error';

class ServiceContainerImpl implements ServiceContainer {
  public constructor() {
    this.jsonSerializer = new JsonSerializerImpl(JSON);

    this.storageService = new StorageServiceImpl();

    this.tabListRepository = new TabListRepositoryImpl(this.storageService);
    this.tabListService = new TabListServiceImpl(this.tabListRepository);

    this.errorReporter = new ErrorReporterImpl(this.jsonSerializer);
    this.typeCheckingService = new TypeCheckingServiceImpl(this.errorReporter);

    this.envService = new EnvServiceImpl(process.env, this.typeCheckingService);

    this.config = new ConfigImpl(this.envService);

    this.messageSender = new ChromeMessageSender();
    this.messageService = new MessageServiceImpl(this.messageSender, this.typeCheckingService);

    this.loggerHandler = new ConsoleLoggerHandler(console);
    this.loggerStateFactory = new LoggerStateFactoryImpl(this.messageService, this.loggerHandler);
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

  public readonly tabListService: TabListService;
  public readonly tabListRepository: TabListRepository;

  public readonly storageService: StorageService;

  public readonly extensionService: ExtensionService;

  public readonly tabService: TabService;
  public readonly browserTabService: BrowserTabService;

  public readonly keyPressingService: KeyPressingService;

  public readonly errorReportingService: ErrorReportingService;

  public readonly errorProcessingService: ErrorProcessingService;

  public readonly loggerService: LoggerService;
  public readonly loggerStateFactory: LoggerStateFactory;
  public readonly loggerHandler: LoggerHandler;

  public readonly messageService: MessageService;
  public readonly messageSender: MessageSender;

  public readonly config: Config;

  public readonly envService: EnvService;

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
