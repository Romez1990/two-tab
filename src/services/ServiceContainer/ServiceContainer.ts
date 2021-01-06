import { ExtensionService, ExtensionServiceImpl } from '../Extension';
import { TabService, TabServiceImpl } from '../Tab';

export interface ServiceContainer {
  extensionService?: ExtensionService;
  tabService?: TabService;
}

export const serviceContainer: ServiceContainer = {
  extensionService: new ExtensionServiceImpl(),
  tabService: new TabServiceImpl(),
};
