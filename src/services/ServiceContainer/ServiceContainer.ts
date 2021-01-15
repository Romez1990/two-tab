import { MainPageService } from '../MainPage';
import { PopupService } from '../Popup';
import { TabListService, TabListRepository } from '../TabList';
import { StorageService, StorageStateFactory } from '../Storage';
import { BrowserTabService, BrowserTabInteractions } from '../BrowserTab';
import { ExtensionService } from '../Extension';
import { KeyboardService } from '../Keyboard';
import { LoggerService, LoggerStateFactory, LoggerHandler } from '../Logger';
import { MessageService, MessageSender } from '../MessageService';
import { ErrorReportingService } from '../ErrorReporting';
import { ErrorProcessingService } from '../Error';
import { Config } from '../Config';
import { EnvService } from '../Env';
import { TypeCheckingService, ErrorReporter } from '../TypeChecking';
import { DatetimeService } from '../Datetime';
import { UrlProcessingService } from '../UrlProcessing';
import { JsonSerializer } from '../Serializer';
import { StringProcessingService } from '../StringProcessing';
import { ServiceNotProvidedError } from './Errors';

export interface ServiceContainer {
  readonly mainPageService?: MainPageService;

  readonly popupService?: PopupService;

  readonly tabListService?: TabListService;
  readonly tabListRepository?: TabListRepository;

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
