import { Task, of } from 'fp-ts/Task';
import { Config } from '../Config';
import { ErrorReportingService } from './ErrorReportingService';
import { LoggerService } from '../Logger';
import { ErrorProcessingService } from '../Error/ErrorProcessingService';

export class ErrorReportingServiceImpl implements ErrorReportingService {
  public constructor(
    private readonly config: Config,
    private readonly errorProcessingService: ErrorProcessingService,
    private readonly loggerService: LoggerService,
  ) {}

  public report(error: Error, stack: string): Task<void> {
    if (this.config.environment !== 'production') {
      const header = this.errorProcessingService.getHeader(error);
      const json = this.errorProcessingService.toJson(error);
      this.loggerService.error(header);
      this.loggerService.error(json);
      this.loggerService.error('stack:', stack);
      return of(undefined);
    }

    return of(undefined);
  }
}
