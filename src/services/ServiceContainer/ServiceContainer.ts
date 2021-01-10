import { PopupService } from '../Popup';
import { ExtensionService } from '../Extension';
import { TabService, BrowserTabService } from '../Tab';
import { KeyPressingService } from '../KeyPressingService';
import { ErrorReportingService } from '../ErrorReporting';
import { LoggerService, LoggerStateFactory, LoggerDriver } from '../Logger';
import { MessageService, MessageSender } from '../MessageService';
import { Config } from '../Config';
import { EnvService, EnvDriver } from '../Env';
import { TypeCheckingService, ErrorReporter } from '../TypeChecking';
import { JsonSerializer } from '../Serializer';
import { ErrorProcessingService } from '../Error/ErrorProcessingService';

export interface ServiceContainer {
  readonly popupService?: PopupService;

  readonly extensionService?: ExtensionService;

  readonly tabService?: TabService;
  readonly browserTabService?: BrowserTabService;

  readonly keyPressingService?: KeyPressingService;

  readonly loggerService?: LoggerService;
  readonly loggerStateFactory?: LoggerStateFactory;
  readonly loggerDriver?: LoggerDriver;

  readonly messageService?: MessageService;
  readonly messageSender?: MessageSender;

  readonly errorReportingService?: ErrorReportingService;

  readonly errorProcessingService?: ErrorProcessingService;

  readonly config?: Config;

  readonly envService?: EnvService;
  readonly envDriver?: EnvDriver;

  readonly typeCheckingService?: TypeCheckingService;
  readonly errorReporter?: ErrorReporter;

  readonly jsonSerializer?: JsonSerializer;
}
