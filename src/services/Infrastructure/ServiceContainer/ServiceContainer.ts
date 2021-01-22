import { MainPageService } from '../../Components/App/MainPage';
import { PopupService } from '../../Components/Popup';
import { TabListService, TabListRepository, TabListsUpdatingService, TabListSerializer } from '../../Storage/TabList';
import { StorageService, StorageStateFactory } from '../../Storage/Storage';
import { BrowserTabService, BrowserTabInteractions } from '../../Browser/BrowserTab';
import { ExtensionService } from '../../Browser/Extension';
import { KeyboardService } from '../../DOM/Keyboard';
import { LoggerService, LoggerStateFactory, LoggerHandler } from '../../DataProcessing/Logger';
import { MessageService, MessageSender } from '../../Browser/MessageService';
import { ErrorReportingService } from '../ErrorReporting';
import { ErrorProcessingService } from '../Error';
import { Config } from '../Config';
import { EnvService } from '../Env';
import { TypeCheckingService, ErrorReporter } from '../../DataProcessing/TypeChecking';
import { DatetimeService } from '../../DataProcessing/Datetime';
import { UrlProcessingService } from '../../DataProcessing/UrlProcessing';
import { JsonSerializer } from '../../DataProcessing/Serializer';
import { StringProcessingService } from '../../DataProcessing/StringProcessing';
import { ServiceNotProvidedError } from './Errors';

export interface ServiceContainer {
  readonly mainPageService?: MainPageService;

  readonly popupService?: PopupService;

  readonly tabListService?: TabListService;
  readonly tabListRepository?: TabListRepository;
  readonly tabListsUpdatingService?: TabListsUpdatingService;
  readonly tabListSerializer?: TabListSerializer;

  readonly storageService?: StorageService;
  readonly storageStateFactory?: StorageStateFactory;

  readonly browserTabService?: BrowserTabService;
  readonly browserTabInteractions?: BrowserTabInteractions;

  readonly extensionService?: ExtensionService;

  readonly keyboardService?: KeyboardService;

  readonly loggerService?: LoggerService;
  readonly loggerStateFactory?: LoggerStateFactory;
  readonly loggerHandler?: LoggerHandler;

  readonly messageService?: MessageService;
  readonly messageSender?: MessageSender;

  readonly errorReportingService?: ErrorReportingService;

  readonly errorProcessingService?: ErrorProcessingService;

  readonly config?: Config;

  readonly envService?: EnvService;

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
