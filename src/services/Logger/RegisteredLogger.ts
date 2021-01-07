import { LoggerDriver } from './LoggerDriver';
import { LoggerState } from './LoggerState';

export class RegisteredLogger implements LoggerState {
  public constructor(private readonly driver: LoggerDriver) {}

  public registerDriver(): void {
    throw new Error('Driver is already registered');
  }

  public log(data: unknown): void {
    this.driver.log(data);
  }
}
