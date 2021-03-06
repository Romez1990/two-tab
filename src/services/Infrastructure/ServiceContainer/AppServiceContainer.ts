import axios from 'axios';
import { TabListSPageService, TabListsPageServiceImpl } from '../../Components/App/TabLists';
import { ImportExportPageService, ImportExportPageServiceImpl } from '../../Components/App/ImportExport';
import { PopupService, PopupServiceImpl } from '../../Components/Popup';
import {
  StorageImportExportService,
  StorageImportExportServiceImpl,
  ExportStrategyFactory,
  ExportStrategyFactoryImpl,
  BetterOneTabTabListExportSerializer,
  BetterOneTabTabListExportSerializerImpl,
  TabListExportSerializer,
  TabListExportSerializerImpl,
  TabExportSerializer,
  TabExportSerializerImpl,
} from '../../Storage/ImportExport';
import {
  TabListService,
  TabListServiceImpl,
  TabService,
  TabServiceImpl,
  TabListRepository,
  TabListRepositoryImpl,
  TabRepository,
  TabRepositoryImpl,
  TabListNormalizer,
  TabListNormalizerImpl,
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
import { FileReadingService, FileReadingServiceImpl } from '../../DOM/FileReading';
import { DownloadService, DownloadServiceImpl } from '../../DOM/Download';
import { KeyboardService, KeyboardServiceImpl } from '../../DOM/Keyboard';
import { HttpService, HttpServiceImpl, RequestService, AxiosRequestService } from '../../Network/Http';
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
import { Config, ConfigImpl } from '../Config';
import { EnvService, EnvServiceImpl } from '../Env';
import {
  BrowserTabService,
  BrowserTabServiceImpl,
  BrowserTabInteractions,
  ChromeTabInteractions,
} from '../../Browser/BrowserTab';
import { MessageService, MessageServiceImpl, MessageSender, ChromeMessageSender } from '../../Browser/MessageService';
import { ExtensionService, ChromeExtensionService } from '../../Browser/Extension';
import {
  TypeCheckingService,
  TypeCheckingServiceImpl,
  ErrorReporter,
  ErrorReporterImpl,
} from '../../DataProcessing/TypeChecking';
import { DatetimeService, DatetimeServiceImpl } from '../../DataProcessing/Datetime';
import { UrlProcessingService, UrlProcessingServiceImpl } from '../../DataProcessing/UrlProcessing';
import { JsonSerializer, JsonSerializerImpl } from '../../DataProcessing/Serializer';
import { StringProcessingService, StringProcessingServiceImpl } from '../../DataProcessing/StringProcessing';
import { ServiceContainer, getService } from './ServiceContainer';

export class AppServiceContainer implements ServiceContainer {
  public constructor() {
    this.stringProcessingService = new StringProcessingServiceImpl();

    this.jsonSerializer = new JsonSerializerImpl(JSON);

    this.urlProcessingService = new UrlProcessingServiceImpl(this.stringProcessingService);

    this.datetimeService = new DatetimeServiceImpl();

    this.errorReporter = new ErrorReporterImpl(this.jsonSerializer);
    this.typeCheckingService = new TypeCheckingServiceImpl(this.errorReporter);

    this.extensionService = new ChromeExtensionService();

    this.messageSender = new ChromeMessageSender();
    this.messageService = new MessageServiceImpl(this.messageSender, this.typeCheckingService);

    this.browserTabInteractions = new ChromeTabInteractions();
    this.browserTabService = new BrowserTabServiceImpl(this.browserTabInteractions, this.extensionService);

    this.envService = new EnvServiceImpl(process.env, this.typeCheckingService);

    this.config = new ConfigImpl(this.envService);

    this.loggerHandler = new ConsoleLoggerHandler(console);
    this.loggerStateFactory = new LoggerStateFactoryImpl(this.messageService, this.loggerHandler);
    this.loggerService = new LoggerServiceImpl(this.loggerStateFactory);

    this.errorProcessingService = new ErrorProcessingServiceImpl(this.jsonSerializer);

    this.errorReportingService = new ErrorReportingServiceImpl(
      this.config,
      this.errorProcessingService,
      this.loggerService,
    );

    this.requestService = new AxiosRequestService(axios, this.errorProcessingService);
    this.httpService = new HttpServiceImpl(this.requestService, this.typeCheckingService, this.config);

    this.keyboardService = new KeyboardServiceImpl(window);

    this.downloadService = new DownloadServiceImpl(document);

    this.fileReadingService = new FileReadingServiceImpl();

    this.storageStateFactory = new StorageStateFactoryImpl();
    this.storageService = new StorageServiceImpl(this.storageStateFactory);

    this.tabListSerializer = new TabListSerializerImpl(this.datetimeService);
    this.tabListsUpdatingService = new TabListsUpdatingServiceImpl(this.messageService, this.tabListSerializer);
    this.tabListRepository = new TabListRepositoryImpl(this.storageService);
    this.tabListNormalizer = new TabListNormalizerImpl();
    this.tabRepository = new TabRepositoryImpl(this.storageService);
    this.tabService = new TabServiceImpl(this.tabRepository);
    this.tabListService = new TabListServiceImpl(
      this.tabListRepository,
      this.tabService,
      this.tabListNormalizer,
      this.tabListsUpdatingService,
      this.datetimeService,
    );

    this.tabExportSerializer = new TabExportSerializerImpl();
    this.tabListExportSerializer = new TabListExportSerializerImpl(this.tabExportSerializer, this.datetimeService);
    this.betterOneTabTabListExportSerializer = new BetterOneTabTabListExportSerializerImpl(
      this.tabExportSerializer,
      this.datetimeService,
    );
    this.dataExporterFactory = new ExportStrategyFactoryImpl(
      this.tabListExportSerializer,
      this.betterOneTabTabListExportSerializer,
    );
    this.storageImportExportService = new StorageImportExportServiceImpl(
      this.tabListRepository,
      this.tabRepository,
      this.dataExporterFactory,
      this.jsonSerializer,
      this.typeCheckingService,
    );

    this.popupService = new PopupServiceImpl(this.tabListService, this.browserTabService, this.extensionService);

    this.importExportPageService = new ImportExportPageServiceImpl(
      this.storageImportExportService,
      this.fileReadingService,
      this.downloadService,
    );
    this.tabListsPageService = new TabListsPageServiceImpl(this.tabListService, this.browserTabService);
  }

  public readonly tabListsPageService: TabListSPageService;
  public readonly importExportPageService: ImportExportPageService;

  public readonly popupService: PopupService;

  public readonly storageImportExportService: StorageImportExportService;
  public readonly dataExporterFactory: ExportStrategyFactory;
  public readonly betterOneTabTabListExportSerializer: BetterOneTabTabListExportSerializer;
  public readonly tabListExportSerializer: TabListExportSerializer;
  public readonly tabExportSerializer: TabExportSerializer;

  public readonly tabListService: TabListService;
  public readonly tabService: TabService;
  public readonly tabListRepository: TabListRepository;
  public readonly tabRepository: TabRepository;
  public readonly tabListNormalizer: TabListNormalizer;
  public readonly tabListsUpdatingService: TabListsUpdatingService;
  public readonly tabListSerializer: TabListSerializer;

  public readonly storageService: StorageService;
  public readonly storageStateFactory: StorageStateFactory;

  public readonly fileReadingService: FileReadingService;

  public readonly downloadService: DownloadService;

  public readonly keyboardService: KeyboardService;

  public readonly httpService: HttpService;
  public readonly requestService: RequestService;

  public readonly errorProcessingService: ErrorProcessingService;

  public readonly errorReportingService: ErrorReportingService;

  public readonly loggerService: LoggerService;
  public readonly loggerStateFactory: LoggerStateFactory;
  public readonly loggerHandler: LoggerHandler;

  public readonly config: Config;

  public readonly envService: EnvService;

  public readonly browserTabService: BrowserTabService;
  public readonly browserTabInteractions: BrowserTabInteractions;

  public readonly messageService: MessageService;
  public readonly messageSender: MessageSender;

  public readonly extensionService: ExtensionService;

  public readonly typeCheckingService: TypeCheckingService;
  public readonly errorReporter: ErrorReporter;

  public readonly datetimeService: DatetimeService;

  public readonly urlProcessingService: UrlProcessingService;

  public readonly jsonSerializer: JsonSerializer;

  public readonly stringProcessingService: StringProcessingService;

  public get = <T extends keyof ServiceContainer>(serviceName: T): NonNullable<ServiceContainer[T]> =>
    getService(this, serviceName);
}
