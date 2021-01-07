import { Message } from './Message';
import { MessageType } from './MessageType';

export interface MessageService {
  sendMessage<TType extends MessageType, TData>(message: Message<TType, TData>): void;
  addHandler<TM extends Message<TType, TData>, TType extends MessageType, TData>(
    messageType: TType,
    handler: (data: TData) => void,
  ): void;
}
