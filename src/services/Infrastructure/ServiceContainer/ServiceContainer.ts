import { MainPageService } from '../../Components/App/MainPage';
import { ImportExportService } from '../../Components/App/ImportExport';
import { PopupService } from '../../Components/Popup';
import { StorageImportExportService, TabListExportSerializer, TabExportSerializer } from '../../Storage/ImportExport';
import {
  TabListService,
  TabListRepository,
  TabRepository,
  TabListsUpdatingService,
  TabListSerializer,
} from '../../Storage/TabList';
import { StorageService, StorageStateFactory } from '../../Storage/Storage';
import { FileReadingService } from '../../DOM/FileReading';
import { DownloadService } from '../../DOM/Download';
import { KeyboardService } from '../../DOM/Keyboard';
import { LoggerService, LoggerStateFactory, LoggerHandler } from '../Logger';
import { ErrorReportingService } from '../ErrorReporting';
import { ErrorProcessingService } from '../Error';
import { Config } from '../Config';
import { EnvService } from '../Env';
import { BrowserTabService, BrowserTabInteractions } from '../../Browser/BrowserTab';
import { MessageService, MessageSender } from '../../Browser/MessageService';
import { ExtensionService } from '../../Browser/Extension';
import { TypeCheckingService, ErrorReporter } from '../../DataProcessing/TypeChecking';
import { DatetimeService } from '../../DataProcessing/Datetime';
import { UrlProcessingService } from '../../DataProcessing/UrlProcessing';
import { JsonSerializer } from '../../DataProcessing/Serializer';
import { StringProcessingService } from '../../DataProcessing/StringProcessing';
import { ServiceNotProvidedError } from './Errors';

export interface ServiceContainer {
  readonly mainPageService?: MainPageService;
  readonly importExportService?: ImportExportService;

  readonly popupService?: PopupService;

  readonly storageImportExportService?: StorageImportExportService;
  readonly tabListExportSerializer?: TabListExportSerializer;
  readonly tabExportSerializer?: TabExportSerializer;

  readonly tabListService?: TabListService;
  readonly tabListRepository?: TabListRepository;
  readonly tabRepository?: TabRepository;
  readonly tabListsUpdatingService?: TabListsUpdatingService;
  readonly tabListSerializer?: TabListSerializer;

  readonly storageService?: StorageService;
  readonly storageStateFactory?: StorageStateFactory;

  readonly fileReadingService?: FileReadingService;

  readonly downloadService?: DownloadService;

  readonly keyboardService?: KeyboardService;

  readonly loggerService?: LoggerService;
  readonly loggerStateFactory?: LoggerStateFactory;
  readonly loggerHandler?: LoggerHandler;

  readonly errorReportingService?: ErrorReportingService;

  readonly errorProcessingService?: ErrorProcessingService;

  readonly config?: Config;

  readonly envService?: EnvService;

  readonly browserTabService?: BrowserTabService;
  readonly browserTabInteractions?: BrowserTabInteractions;

  readonly messageService?: MessageService;
  readonly messageSender?: MessageSender;

  readonly extensionService?: ExtensionService;

  readonly typeCheckingService?: TypeCheckingService;
  readonly errorReporter?: ErrorReporter;

  readonly datetimeService?: DatetimeService;

  readonly urlProcessingService?: UrlProcessingService;

  readonly jsonSerializer?: JsonSerializer;

  readonly stringProcessingService?: StringProcessingService;
}

export function getService<T extends keyof ServiceContainer>(
  container: ServiceContainer,
  serviceName: T,
): NonNullable<ServiceContainer[T]> {
  const service = container[serviceName];
  if (service === null) throw new ServiceNotProvidedError(serviceName);
  return service as NonNullable<ServiceContainer[T]>;
}
