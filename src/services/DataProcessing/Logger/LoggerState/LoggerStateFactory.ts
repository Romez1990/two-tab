import { LoggerState } from './LoggerState';

export interface LoggerStateFactory {
  createTransmitter(): LoggerState;
  createReceiver(): LoggerState;
}
