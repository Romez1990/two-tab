import { ExtensionService } from '../Extension';
import { TabService, BrowserTabService } from '../Tab';
import { LoggerService, LoggerDriver } from '../Logger';
import { MessageService, MessageSender } from '../MessageService';
import { TypeCheckingService, ErrorReporter } from '../TypeChecking';

export interface ServiceContainer {
  readonly extensionService?: ExtensionService;

  readonly tabService?: TabService;
  readonly browserTabService?: BrowserTabService;

  readonly loggerService?: LoggerService;
  readonly loggerDriver?: LoggerDriver;

  readonly messageService?: MessageService;
  readonly messageSender?: MessageSender;

  readonly typeCheckingService?: TypeCheckingService;
  readonly errorReporter?: ErrorReporter;
}
