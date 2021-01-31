import { AppExportStrategy, TabListExportSerializer } from './AppExportStrategy';
import { BetterOneTabExportStrategy, BetterOneTabTabListExportSerializer } from './BetterOneTabExportStrategy';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const getExportStrategies = (
  tabListExportSerializer: TabListExportSerializer,
  betterOneTabTabListExportSerializer: BetterOneTabTabListExportSerializer,
) => ({
  app: () => new AppExportStrategy(tabListExportSerializer),
  betterOneTab: () => new BetterOneTabExportStrategy(betterOneTabTabListExportSerializer),
});

export type ExportStrategyName = keyof ReturnType<typeof getExportStrategies>;
