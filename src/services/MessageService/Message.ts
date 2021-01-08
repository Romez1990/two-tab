import { type, unknown } from 'io-ts';
import { MessageTypeT, MessageType } from './MessageType';

export const MessageT = type({
  type: MessageTypeT,
  data: unknown,
});

export interface Message<TType extends MessageType, TData> {
  readonly type: TType;
  readonly data: TData;
}
