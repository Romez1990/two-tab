import { LoggerService } from './LoggerService';
import { LoggerDriver } from './LoggerDriver';
import { MessageService } from '../MessageService';
import { LogMessage } from './LogMessage';

export class LoggerServiceImpl implements LoggerService {
  public constructor(private readonly loggerDriver: LoggerDriver, private readonly messageService: MessageService) {}

  private isReceiver = false;

  public registerReceiver(): void {
    this.isReceiver = true;
    this.addMessageHandlers();
  }

  private addMessageHandlers(): void {
    this.messageService.addHandler<LogMessage>()('log', this.log.bind(this));
  }

  public log(data: unknown): void {
    if (this.isReceiver) {
      this.loggerDriver.log(data);
    } else {
      const message = new LogMessage(data);
      this.messageService.sendMessage(message);
    }
  }
}
