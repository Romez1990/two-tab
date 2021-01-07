import { ConnectionService } from './ConnectionService';
import { Connection } from './Connection';
import { Message } from './Message';

type Handler<T> = (data: T) => void;

export class ConnectionServiceImpl implements ConnectionService {
  public constructor(private readonly connection: Connection) {
    this.connection.onMessage(data => this.handleData(data));
  }

  public sendMessage<T>(message: Message<T>): void {
    this.connection.sendMessage(message);
  }

  private readonly handlers = new Map<typeof Message, Handler<unknown>>();

  public onMessage<M extends Message<T>, T>(messageType: typeof Message, handler: Handler<T>): void {
    if (this.handlers.has(messageType)) {
      throw new Error(`Handles for ${messageType} is already added`);
    }
    this.handlers.set(messageType, handler as Handler<unknown>);
  }

  private handleData(data: unknown): void {
    if (!(data instanceof Message)) {
      throw new Error('Data is not a message');
    } else {
      this.handleMessage(data);
    }
  }

  private handleMessage(message: Message<unknown>): void {
    const messageType = message.constructor as typeof Message;
    const handler = this.handlers.get(messageType);
    if (typeof handler === 'undefined') {
      throw new Error(`No handler for ${messageType}`);
    } else {
      handler(message.data);
    }
  }
}
