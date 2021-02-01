import { LoggerService } from './LoggerService';

export class FakeLoggerService implements LoggerService {
  public constructor(private readonly console: Console) {}

  public registerAsReceiver(): void {
    //
  }

  public debug(...args: ReadonlyArray<unknown>): void {
    this.console.debug(...args);
  }

  public info(...args: ReadonlyArray<unknown>): void {
    this.console.info(...args);
  }

  public warning(...args: ReadonlyArray<unknown>): void {
    this.console.warn(...args);
  }

  public error(...args: ReadonlyArray<unknown>): void {
    this.console.error(...args);
  }
}
