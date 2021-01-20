import { LoggerReceiverAlreadyRegisteredError } from './Errors';
import { LoggerService } from './LoggerService';
import { LoggerState, LoggerStateFactory } from './LoggerState';

export class LoggerServiceImpl implements LoggerService {
  public constructor(private readonly loggerStateFactory: LoggerStateFactory) {
    this.state = this.loggerStateFactory.createTransmitter();
  }

  private state: LoggerState;
  private isReceiver = false;

  public registerAsReceiver(): void {
    if (this.isReceiver) {
      throw new LoggerReceiverAlreadyRegisteredError();
    }
    this.isReceiver = true;
    this.state = this.loggerStateFactory.createReceiver();
  }

  public debug(...args: ReadonlyArray<unknown>): void {
    this.state.debug(args);
  }

  public info(...args: ReadonlyArray<unknown>): void {
    this.state.info(args);
  }

  public warning(...args: ReadonlyArray<unknown>): void {
    this.state.warning(args);
  }

  public error(...args: ReadonlyArray<unknown>): void {
    this.state.error(args);
  }
}
