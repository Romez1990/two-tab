import { LoggerService } from './LoggerService';
import { LoggerDriver } from './LoggerDriver';
import { LoggerState } from './LoggerState';
import { UnregisteredLogger } from './UnregisteredLogger';
import { RegisteredLogger } from './RegisteredLogger';

export class LoggerServiceImpl implements LoggerService {
  public constructor() {
    this.loggerState = new UnregisteredLogger();
  }

  private loggerState: LoggerState;

  public registerDriver(driver: LoggerDriver): void {
    this.loggerState = new RegisteredLogger(driver);
  }

  public log(data: unknown): void {
    this.loggerState.log(data);
  }
}
