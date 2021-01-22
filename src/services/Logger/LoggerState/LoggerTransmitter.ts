import { pipe } from 'fp-ts/function';
import { MessageService } from '../../MessageService';
import { LogMessage, LogType } from '../Message';
import { LoggerState } from './LoggerState';

export class LoggerTransmitter implements LoggerState {
  public constructor(private readonly messageService: MessageService) {}

  public debug(args: ReadonlyArray<unknown>): void {
    this.sendMessage('debug', args);
  }

  public info(args: ReadonlyArray<unknown>): void {
    this.sendMessage('info', args);
  }

  public warning(args: ReadonlyArray<unknown>): void {
    this.sendMessage('warning', args);
  }

  public error(args: ReadonlyArray<unknown>): void {
    this.sendMessage('error', args);
  }

  private sendMessage(type: LogType, args: ReadonlyArray<unknown>) {
    const message = new LogMessage(type, args);
    this.messageService.sendMessage(message);
  }
}
