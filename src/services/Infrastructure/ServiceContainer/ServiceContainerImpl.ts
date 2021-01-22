import { MainPageService, MainPageServiceImpl } from '../../Components/App/MainPage';
import { PopupService, PopupServiceImpl } from '../../Components/Popup';
import {
  TabListService,
  TabListServiceImpl,
  TabListRepository,
  TabListRepositoryImpl,
  TabListsUpdatingService,
  TabListsUpdatingServiceImpl,
  TabListSerializer,
  TabListSerializerImpl,
} from '../../Storage/TabList';
import {
  StorageService,
  StorageServiceImpl,
  StorageStateFactory,
  StorageStateFactoryImpl,
} from '../../Storage/Storage';
import {
  BrowserTabService,
  BrowserTabServiceImpl,
  BrowserTabInteractions,
  ChromeTabInteractions,
} from '../../Browser/BrowserTab';
import { ExtensionService, ChromeExtensionService } from '../../Browser/Extension';
import { KeyboardService, KeyboardServiceImpl } from '../../DOM/Keyboard';
import { ErrorReportingService, ErrorReportingServiceImpl } from '../ErrorReporting';
import { ErrorProcessingService, ErrorProcessingServiceImpl } from '../Error';
import {
  LoggerService,
  LoggerServiceImpl,
  LoggerHandler,
  ConsoleLoggerHandler,
  LoggerStateFactory,
  LoggerStateFactoryImpl,
} from '../../DataProcessing/Logger';
import { MessageService, MessageServiceImpl, MessageSender, ChromeMessageSender } from '../../Browser/MessageService';
import { Config, ConfigImpl } from '../Config';
import { EnvService, EnvServiceImpl } from '../Env';
import {
  TypeCheckingService,
  TypeCheckingServiceImpl,
  ErrorReporter,
  ErrorReporterImpl,
} from '../../DataProcessing/TypeChecking';
import { getService, ServiceContainer } from './ServiceContainer';
import { DatetimeService, DatetimeServiceImpl } from '../../DataProcessing/Datetime';
import { UrlProcessingService, UrlProcessingServiceImpl } from '../../DataProcessing/UrlProcessing';
import { JsonSerializer, JsonSerializerImpl } from '../../DataProcessing/Serializer';
import { StringProcessingService, StringProcessingServiceImpl } from '../../DataProcessing/StringProcessing';

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

    this.keyboardService = new KeyboardServiceImpl(window);

    this.extensionService = new ChromeExtensionService();

    this.browserTabInteractions = new ChromeTabInteractions();
    this.browserTabService = new BrowserTabServiceImpl(this.browserTabInteractions, this.extensionService);

    this.storageStateFactory = new StorageStateFactoryImpl();
    this.storageService = new StorageServiceImpl(this.storageStateFactory);

    this.tabListSerializer = new TabListSerializerImpl(this.datetimeService);
    this.tabListsUpdatingService = new TabListsUpdatingServiceImpl(this.messageService, this.tabListSerializer);
    this.tabListRepository = new TabListRepositoryImpl(this.storageService);
    this.tabListService = new TabListServiceImpl(
      this.tabListRepository,
      this.tabListsUpdatingService,
      this.datetimeService,
    );

    this.popupService = new PopupServiceImpl(this.tabListService, this.browserTabService, this.extensionService);

    this.mainPageService = new MainPageServiceImpl(this.tabListService, this.browserTabService);
  }

  public readonly mainPageService: MainPageService;

  public readonly popupService: PopupService;

  public readonly tabListService: TabListService;
  public readonly tabListRepository: TabListRepository;
  public readonly tabListsUpdatingService: TabListsUpdatingService;
  public readonly tabListSerializer: TabListSerializer;

  public readonly storageService: StorageService;
  public readonly storageStateFactory: StorageStateFactory;

  public readonly browserTabService: BrowserTabService;
  public readonly browserTabInteractions: BrowserTabInteractions;

  public readonly extensionService: ExtensionService;

  public readonly keyboardService: KeyboardService;

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