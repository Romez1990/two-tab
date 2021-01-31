import { Lazy } from 'fp-ts/function';
import { ReadonlyRecord } from 'fp-ts/ReadonlyRecord';
import { ExportStrategy } from './ExportStrategy';
import { ExportStrategyFactory } from './ExportStrategyFactory';
import { TabListExportSerializer } from './AppExportStrategy';
import { BetterOneTabTabListExportSerializer } from './BetterOneTabExportStrategy';
import { ExportStrategyName, getExportStrategies } from './exportStrategies';

export class ExportStrategyFactoryImpl implements ExportStrategyFactory {
  public constructor(
    tabListExportSerializer: TabListExportSerializer,
    betterOneTabTabListExportSerializer: BetterOneTabTabListExportSerializer,
  ) {
    this.exportStrategies = getExportStrategies(
      tabListExportSerializer,
      betterOneTabTabListExportSerializer,
    ) as ReadonlyRecord<ExportStrategyName, Lazy<ExportStrategy>>;
  }

  private readonly exportStrategies: ReadonlyRecord<ExportStrategyName, Lazy<ExportStrategy>>;

  public create = (strategyName: ExportStrategyName): ExportStrategy => this.exportStrategies[strategyName]();
}
