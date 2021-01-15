import { MainPageService, MainPageServiceImpl } from '../MainPage';
import { PopupService, PopupServiceImpl } from '../Popup';
import { TabListService, TabListServiceImpl, TabListRepository, TabListRepositoryImpl } from '../TabList';
import { StorageService, StorageServiceImpl, StorageStateFactory, StorageStateFactoryImpl } from '../Storage';
import { BrowserTabService, BrowserTabServiceImpl, BrowserTabInteractions, ChromeTabInteractions } from '../BrowserTab';
import { ExtensionService, ChromeExtensionService } from '../Extension';
import { KeyPressingService, KeyPressingServiceImpl } from '../KeyPressingService';
import { ErrorReportingService, ErrorReportingServiceImpl } from '../ErrorReporting';
import { ErrorProcessingService, ErrorProcessingServiceImpl } from '../Error';
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
import { getService, ServiceContainer } from './ServiceContainer';
import { DatetimeService, DatetimeServiceImpl } from '../Datetime';
import { UrlProcessingService, UrlProcessingServiceImpl } from '../UrlProcessing';
import { JsonSerializer, JsonSerializerImpl } from '../Serializer';
import { StringProcessingService, StringProcessingServiceImpl } from '../StringProcessing';

class ServiceContainerImpl implements ServiceContainer {
  public constructor() {
    this.stringProcessingService = new StringProcessingServiceImpl();

    this.jsonSerializer = new JsonSerializerImpl(JSON);

    this.urlProcessingService = new UrlProcessingServiceImpl(this.stringProcessingService);

    this.datetimeService = new DatetimeServiceImpl();

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

    this.browserTabInteractions = new ChromeTabInteractions();
    this.browserTabService = new BrowserTabServiceImpl(this.browserTabInteractions, this.extensionService);

    this.storageStateFactory = new StorageStateFactoryImpl();
    this.storageService = new StorageServiceImpl(this.storageStateFactory);

    this.tabListRepository = new TabListRepositoryImpl(this.storageService);
    this.tabListService = new TabListServiceImpl(this.tabListRepository, this.datetimeService);

    this.popupService = new PopupServiceImpl(this.tabListService, this.browserTabService, this.extensionService);

    this.mainPageService = new MainPageServiceImpl(this.tabListService, this.browserTabService);
  }

  public readonly mainPageService: MainPageService;

  public readonly popupService: PopupService;

  public readonly tabListService: TabListService;
  public readonly tabListRepository: TabListRepository;

  public readonly storageService: StorageService;
  public readonly storageStateFactory: StorageStateFactory;

  public readonly browserTabService: BrowserTabService;
  public readonly browserTabInteractions: BrowserTabInteractions;

  public readonly extensionService: ExtensionService;

  public readonly keyPressingService: KeyPressingService;

  public readonly errorProcessingService: ErrorProcessingService;

  public readonly errorReportingService: ErrorReportingService;

  public readonly loggerService: LoggerService;
  public readonly loggerStateFactory: LoggerStateFactory;
  public readonly loggerHandler: LoggerHandler;

  public readonly messageService: MessageService;
  public readonly messageSender: MessageSender;

  public readonly config: Config;

  public readonly envService: EnvService;

  public readonly typeCheckingService: TypeCheckingService;
  public readonly errorReporter: ErrorReporter;

  public readonly datetimeService: DatetimeService;

  public readonly urlProcessingService: UrlProcessingService;

  public readonly jsonSerializer: JsonSerializer;

  public readonly stringProcessingService: StringProcessingService;

  public get = <T extends keyof ServiceContainer>(serviceName: T): NonNullable<ServiceContainer[T]> =>
    getService(this, serviceName);
}

export const serviceContainer = new ServiceContainerImpl();
