import { MessageService } from '../../MessageService';
import { LogMessage, LogData } from '../Message';
import { LoggerState } from './LoggerState';
import { LoggerHandler } from '../LoggerHandler';

export class LoggerReceiver implements LoggerState {
  public constructor(private readonly loggerHandler: LoggerHandler, messageService: MessageService) {
    messageService.addHandler<LogMessage>()('log', this.messageHandler.bind(this));
  }

  private messageHandler(data: LogData): void {
    const { type, args } = data;
    const method = this[type].bind(this);
    method(args);
  }

  public debug(args: ReadonlyArray<unknown>): void {
    this.loggerHandler.debug(args);
  }

  public info(args: ReadonlyArray<unknown>): void {
    this.loggerHandler.info(args);
  }

  public warning(args: ReadonlyArray<unknown>): void {
    this.loggerHandler.warning(args);
  }

  public error(args: ReadonlyArray<unknown>): void {
    this.loggerHandler.error(args);
  }
}
