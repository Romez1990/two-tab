import { LoggerDriver } from './LoggerDriver';

export interface LoggerState extends LoggerDriver {
  registerDriver(driver: LoggerDriver): void;
}
