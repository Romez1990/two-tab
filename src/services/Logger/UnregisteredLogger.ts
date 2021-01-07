import { LoggerState } from './LoggerState';

export class UnregisteredLogger implements LoggerState {
  public registerDriver(): void {
    throw new Error('Not implemented');
  }

  public log(): void {
    throw new Error('Driver is not registered');
  }
}
