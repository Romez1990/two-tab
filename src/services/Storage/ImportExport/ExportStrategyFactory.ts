import { ExportStrategy } from './ExportStrategy';
import { ExportStrategyName } from './exportStrategies';

export interface ExportStrategyFactory {
  create(strategyName: ExportStrategyName): ExportStrategy;
}
