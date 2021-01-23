import { MessageService } from '../../../Browser/MessageService';
import { LoggerHandler } from '../LoggerHandler';
import { LoggerStateFactory } from './LoggerStateFactory';
import { LoggerState } from './LoggerState';
import { LoggerTransmitter } from './LoggerTransmitter';
import { LoggerReceiver } from './LoggerReceiver';

export class LoggerStateFactoryImpl implements LoggerStateFactory {
  public constructor(private readonly messageService: MessageService, private readonly loggerHandler: LoggerHandler) {}

  public createTransmitter(): LoggerState {
    return new LoggerTransmitter(this.messageService);
  }

  public createReceiver(): LoggerState {
    return new LoggerReceiver(this.loggerHandler, this.messageService);
  }
}
