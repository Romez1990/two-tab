import { Task } from 'fp-ts/Task';

export interface ImportExportService {
  import(json: string): void;
  export(): Task<string>;
}
