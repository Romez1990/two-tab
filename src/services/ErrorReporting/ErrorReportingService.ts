import { Task } from 'fp-ts/Task';

export interface ErrorReportingService {
  report(error: Error, stack: string): Task<void>;
}
