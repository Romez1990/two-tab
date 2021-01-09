import { LoggerDriver } from './LoggerDriver';

export interface LoggerService extends LoggerDriver {
  registerReceiver(): void;
}
