import { PopupService } from '../Popup';
import { TabListService, TabListRepository } from '../TabList';
import { StorageService } from '../Storage';
import { ExtensionService } from '../Extension';
import { TabService, BrowserTabService } from '../BrowserTab';
import { KeyPressingService } from '../KeyPressingService';
import { LoggerService, LoggerStateFactory, LoggerHandler } from '../Logger';
import { MessageService, MessageSender } from '../MessageService';
import { ErrorReportingService } from '../ErrorReporting';
import { ErrorProcessingService } from '../Error';
import { Config } from '../Config';
import { EnvService } from '../Env';
import { TypeCheckingService, ErrorReporter } from '../TypeChecking';
import { JsonSerializer } from '../Serializer';

export interface ServiceContainer {
  readonly popupService?: PopupService;

  readonly tabListService?: TabListService;
  readonly tabListRepository?: TabListRepository;

  readonly storageService?: StorageService;

  readonly extensionService?: ExtensionService;

  readonly tabService?: TabService;
  readonly browserTabService?: BrowserTabService;

  readonly keyPressingService?: KeyPressingService;

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

  readonly jsonSerializer?: JsonSerializer;
}
