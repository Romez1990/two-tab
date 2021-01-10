import { LoggerDriver } from './LoggerDriver';

export class ConsoleLoggerDriver implements LoggerDriver {
  public log(...data: ReadonlyArray<unknown>): void {
    // eslint-disable-next-line no-console
    console.log(...data);
  }
}
