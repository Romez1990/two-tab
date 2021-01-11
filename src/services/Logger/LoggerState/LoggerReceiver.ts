import { MessageService } from '../../MessageService';
import { LogMessage, LogData } from '../Message';
import { LoggerState } from './LoggerState';
import { LoggerHandler } from '../LoggerHandler';

export class LoggerReceiver implements LoggerState {
  public constructor(private readonly loggerDriver: LoggerHandler, messageService: MessageService) {
    messageService.addHandler<LogMessage>()('log', this.messageHandler.bind(this));
  }

  private messageHandler(data: LogData): void {
    const { type, args } = data;
    const method = this[type].bind(this);
    method(args);
  }

  public debug(args: ReadonlyArray<unknown>): void {
    this.loggerDriver.debug(args);
  }

  public info(args: ReadonlyArray<unknown>): void {
    this.loggerDriver.info(args);
  }

  public warning(args: ReadonlyArray<unknown>): void {
    this.loggerDriver.warning(args);
  }

  public error(args: ReadonlyArray<unknown>): void {
    this.loggerDriver.error(args);
  }
}
