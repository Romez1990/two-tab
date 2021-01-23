import { Task, of } from 'fp-ts/Task';
import { Config } from '../Config';
import { ErrorReportingService } from './ErrorReportingService';
import { LoggerService } from '../Logger';
import { ErrorProcessingService } from '../Error';

export class ErrorReportingServiceImpl implements ErrorReportingService {
  public constructor(
    private readonly config: Config,
    private readonly errorProcessing: ErrorProcessingService,
    private readonly logger: LoggerService,
  ) {}

  public report(error: Error, stack: string): Task<void> {
    if (!this.config.isProduction) {
      const header = this.errorProcessing.getHeader(error);
      const json = this.errorProcessing.toJson(error);
      this.logger.error(header);
      this.logger.error(json);
      this.logger.error('stack:', stack);
      return of(undefined);
    }

    return of(undefined);
  }
}
