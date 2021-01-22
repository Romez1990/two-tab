import { Message } from './Message';
import { MessageType } from './MessageType';

export interface MessageService {
  sendMessage<TType extends MessageType, TData>(message: Message<TType, TData>): void;
  addHandler<TM extends Message<MessageType, unknown>>(): (
    messageType: TM['type'],
    handler: (data: TM['data']) => void,
  ) => void;
}
