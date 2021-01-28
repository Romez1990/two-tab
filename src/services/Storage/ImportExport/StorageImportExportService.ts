import { Task } from 'fp-ts/Task';
import { TaskEither } from 'fp-ts/TaskEither';
import { TypeCheckingError } from '../../DataProcessing/TypeChecking';

export interface StorageImportExportService {
  export(): Task<string>;
  import(json: string): TaskEither<TypeCheckingError, void>;
}
