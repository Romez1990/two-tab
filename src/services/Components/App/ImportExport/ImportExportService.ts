import { Task } from 'fp-ts/Task';
import { TaskEither } from 'fp-ts/TaskEither';
import { ExportStrategyName } from '../../../Storage/ImportExport';
import { TypeCheckingError } from '../../../DataProcessing/TypeChecking';

export interface ImportExportService {
  readonly strategyNames: ReadonlyArray<ExportStrategyName>;
  setStrategy(strategyName: ExportStrategyName): void;
  import(file: File): TaskEither<TypeCheckingError, void>;
  export(): Task<void>;
}
