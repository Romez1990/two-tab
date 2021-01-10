import { LoggerService } from './LoggerService';
import { LoggerState, LoggerStateFactory } from './LoggerState';
import { ReceiverAlreadyRegisteredError } from './ReceiverAlreadyRegisteredError';

export class LoggerServiceImpl implements LoggerService {
  public constructor(private readonly loggerStateFactory: LoggerStateFactory) {
    this.loggerState = this.loggerStateFactory.createTransmitter();
  }

  private loggerState: LoggerState;
  private isReceiver = false;

  public registerReceiver(): void {
    if (this.isReceiver) {
      throw new ReceiverAlreadyRegisteredError();
    }
    this.isReceiver = true;
    this.loggerState = this.loggerStateFactory.createReceiver();
  }

  public debug(...args: ReadonlyArray<unknown>): void {
    this.loggerState.debug(args);
  }

  public info(...args: ReadonlyArray<unknown>): void {
    this.loggerState.info(args);
  }

  public warning(...args: ReadonlyArray<unknown>): void {
    this.loggerState.warning(args);
  }

  public error(...args: ReadonlyArray<unknown>): void {
    this.loggerState.error(args);
  }
}
