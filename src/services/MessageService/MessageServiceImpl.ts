import { MessageSender } from './MessageSender';
import { MessageService } from './MessageService';
import { MessageT, Message } from './Message';
import { MessageType } from './MessageType';
import { TypeCheckingService } from '../TypeChecking';
import { HandlerAlreadyAddedError, HandlerNotFoundError } from './Errors';

type Handler<T> = (data: T) => void;

export class MessageServiceImpl implements MessageService {
  public constructor(
    private readonly messageSender: MessageSender,
    private readonly typeChecking: TypeCheckingService,
  ) {
    this.messageSender.addHandler(this.handleData.bind(this));
  }

  public sendMessage<TType extends MessageType, TData>(message: Message<TType, TData>): void {
    this.messageSender.sendMessage(message);
  }

  private readonly handlers = new Map<MessageType, Handler<unknown>>();

  public addHandler = <TM extends Message<MessageType, unknown>>() => (
    messageType: TM['type'],
    handler: (data: TM['data']) => void,
  ): void => {
    if (this.handlers.has(messageType)) {
      throw new HandlerAlreadyAddedError(messageType);
    }
    this.handlers.set(messageType, handler as Handler<unknown>);
  };

  private handleData(data: unknown): void {
    const message = this.typeChecking.checkAndThrow(MessageT)(data);
    this.handleMessage(message);
  }

  private handleMessage({ type, data }: Message<MessageType, unknown>): void {
    const handler = this.handlers.get(type);
    if (typeof handler === 'undefined') {
      throw new HandlerNotFoundError(type);
    } else {
      handler(data);
    }
  }
}
