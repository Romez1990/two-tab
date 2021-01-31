import { ExportStrategy } from './ExportStrategy';
import { ExportStrategyName } from './exportStrategies';

export interface ExportStrategyFactory {
  readonly strategyNames: ReadonlyArray<ExportStrategyName>;
  create(strategyName: ExportStrategyName): ExportStrategy;
}
