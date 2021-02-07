import { TabListSPageService, StubTabListSPageService } from '../../Components/App/TabLists';
// import { ImportExportPageService } from '../../Components/App/ImportExport';
// import { PopupService } from '../../Components/Popup';
import { StorageService, FakeStorageService } from '../../Storage/Storage';
import { FileReadingService, FileReadingServiceImpl } from '../../DOM/FileReading';
import { DownloadService, DownloadServiceImpl } from '../../DOM/Download';
import { KeyboardService, KeyboardServiceImpl } from '../../DOM/Keyboard';
import { ErrorReportingService, ErrorReportingServiceImpl } from '../ErrorReporting';
import { ErrorProcessingService, ErrorProcessingServiceImpl } from '../Error';
import { LoggerService, FakeLoggerService } from '../Logger';
import { Config, ConfigImpl } from '../Config';
import { EnvService, EnvServiceImpl } from '../Env';
// import { ExtensionService } from '../../Browser/Extension';
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
import { ServiceContainer } from './ServiceContainer';

export class BrowserServiceContainer implements ServiceContainer {
  public constructor() {
    this.stringProcessingService = new StringProcessingServiceImpl();

    this.jsonSerializer = new JsonSerializerImpl(JSON);

    this.urlProcessingService = new UrlProcessingServiceImpl(this.stringProcessingService);

    this.datetimeService = new DatetimeServiceImpl();

    this.errorReporter = new ErrorReporterImpl(this.jsonSerializer);
    this.typeCheckingService = new TypeCheckingServiceImpl(this.errorReporter);

    // this.extensionService = new ChromeExtensionService();

    this.envService = new EnvServiceImpl(process.env, this.typeCheckingService);

    this.config = new ConfigImpl(this.envService);

    this.loggerService = new FakeLoggerService(console);

    this.errorProcessingService = new ErrorProcessingServiceImpl(this.jsonSerializer);

    this.errorReportingService = new ErrorReportingServiceImpl(
      this.config,
      this.errorProcessingService,
      this.loggerService,
    );

    this.fileReadingService = new FileReadingServiceImpl();

    this.keyboardService = new KeyboardServiceImpl(window);

    this.downloadService = new DownloadServiceImpl(document);

    this.storageService = new FakeStorageService();

    // this.popupService = new PopupServiceImpl();
    //
    // this.importExportPageService = new ImportExportPageServiceImpl();

    this.tabListsPageService = new StubTabListSPageService();
  }

  public readonly tabListsPageService: TabListSPageService;
  // public readonly importExportPageService: ImportExportPageService;

  // public readonly popupService: PopupService;

  public readonly storageService: StorageService;

  public readonly fileReadingService: FileReadingService;

  public readonly downloadService: DownloadService;

  public readonly keyboardService: KeyboardService;

  public readonly errorProcessingService: ErrorProcessingService;

  public readonly errorReportingService: ErrorReportingService;

  public readonly loggerService: LoggerService;

  public readonly config: Config;

  public readonly envService: EnvService;

  // public readonly extensionService: ExtensionService;

  public readonly typeCheckingService: TypeCheckingService;
  public readonly errorReporter: ErrorReporter;

  public readonly datetimeService: DatetimeService;

  public readonly urlProcessingService: UrlProcessingService;

  public readonly jsonSerializer: JsonSerializer;

  public readonly stringProcessingService: StringProcessingService;
}
