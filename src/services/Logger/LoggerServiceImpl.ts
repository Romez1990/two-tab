import { LoggerService } from './LoggerService';
import { LoggerDriver } from './LoggerDriver';
import { MessageService, ConnectionService, Message } from '../MessageService';
import { LogMessage } from './LogMessage';

export class LoggerServiceImpl implements LoggerService {
  public constructor(private readonly loggerDriver: LoggerDriver, messageService: MessageService) {
    this.connection = messageService.connect('loggerService');
  }

  private readonly connection: ConnectionService;

  private isReceiver = false;

  public registerReceiver(): void {
    this.isReceiver = true;
    this.addMessageHandlers();
  }

  private addMessageHandlers(): void {
    this.connection.onMessage(LogMessage as typeof Message, this.log);
  }

  public log(data: unknown): void {
    if (this.isReceiver) {
      this.loggerDriver.log(data);
    } else {
      const message = new LogMessage(data);
      this.connection.sendMessage(message);
    }
  }
}
