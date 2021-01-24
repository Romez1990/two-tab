import { Task } from 'fp-ts/Task';

export interface FileReadingService {
  readAsText(file: File): Task<string>;
}
