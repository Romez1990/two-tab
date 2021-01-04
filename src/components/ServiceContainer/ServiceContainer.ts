import { ExtensionService, ExtensionServiceImpl } from '../../services/Extension';

export interface ServiceContainer {
  extensionService: ExtensionService;
}

export const serviceContainer: ServiceContainer = {
  extensionService: new ExtensionServiceImpl(),
};
