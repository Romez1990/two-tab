import { ExtensionService } from '../Extension';
import { TabService } from '../Tab';
import { BrowserTabService } from '../Tab/BrowserTab';
import { LoggerService } from '../Logger';

export interface ServiceContainer {
  readonly extensionService?: ExtensionService;
  readonly tabService?: TabService;
  readonly browserTabService?: BrowserTabService;
  readonly loggerService?: LoggerService;
}
