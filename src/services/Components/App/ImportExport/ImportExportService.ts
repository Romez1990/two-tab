import { Task } from 'fp-ts/Task';
import { TaskEither } from 'fp-ts/TaskEither';
import { TypeCheckingError } from '../../../DataProcessing/TypeChecking';

export interface ImportExportService {
  import(file: File): TaskEither<TypeCheckingError, void>;
  export(): Task<void>;
}
