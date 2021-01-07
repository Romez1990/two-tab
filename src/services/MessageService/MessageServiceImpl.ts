import { MessageSender } from './MessageSender';
import { MessageService } from './MessageService';
import { Message } from './Message';
import { MessageType } from './MessageType';

type Handler<T> = (data: T) => void;

export class MessageServiceImpl implements MessageService {
  public constructor(private readonly messageSender: MessageSender) {
    this.messageSender.addHandler(this.handleData.bind(this));
  }

  public sendMessage<TType extends MessageType, TData>(message: Message<TType, TData>): void {
    this.messageSender.sendMessage(message);
  }

  private readonly handlers = new Map<MessageType, Handler<unknown>>();

  public addHandler<TM extends Message<TType, TData>, TType extends MessageType, TData>(
    messageType: TType,
    handler: (data: TData) => void,
  ): void {
    if (this.handlers.has(messageType)) {
      throw new Error(`Handles for ${messageType} is already added`);
    }
    this.handlers.set(messageType, handler as Handler<unknown>);
  }

  private handleData(data: unknown): void {
    const message = data as Message<MessageType, unknown>;
    if (typeof message === 'object' && message !== null && typeof message.type === 'string') {
      this.handleMessage(message);
    } else {
      throw new Error('Data is not a message');
    }
  }

  private handleMessage(message: Message<MessageType, unknown>): void {
    const { type } = message;
    const handler = this.handlers.get(type);
    if (typeof handler === 'undefined') {
      throw new Error(`No handler for ${type}`);
    } else {
      handler(message.data);
    }
  }
}
