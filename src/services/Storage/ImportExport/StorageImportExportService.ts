import { Task } from 'fp-ts/Task';
import { TaskEither } from 'fp-ts/TaskEither';
import { TypeCheckingError } from '../../DataProcessing/TypeChecking';
import { ExportStrategyName } from './exportStrategies';

export interface StorageImportExportService {
  readonly strategyNames: ReadonlyArray<ExportStrategyName>;
  setStrategy(strategyName: ExportStrategyName): void;
  export(): Task<string>;
  import(json: string): TaskEither<TypeCheckingError, void>;
}
