import { Message } from './Message';

export interface ConnectionService {
  sendMessage<T>(message: Message<T>): void;
  onMessage<M extends Message<T>, T>(messageClass: typeof Message, handler: (data: T) => void): void;
}
