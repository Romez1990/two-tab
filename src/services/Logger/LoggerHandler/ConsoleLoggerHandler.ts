import { LoggerHandler } from './LoggerHandler';

export class ConsoleLoggerHandler implements LoggerHandler {
  public constructor(private readonly console: Console) {}

  public debug(args: ReadonlyArray<unknown>): void {
    this.console.debug(...args);
  }

  public info(args: ReadonlyArray<unknown>): void {
    this.console.info(...args);
  }

  public error(args: ReadonlyArray<unknown>): void {
    this.console.error(...args);
  }

  public warning(args: ReadonlyArray<unknown>): void {
    this.console.warn(...args);
  }
}
