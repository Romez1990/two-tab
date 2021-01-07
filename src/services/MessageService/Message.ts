import { MessageType } from './MessageType';

export interface Message<TType extends MessageType, TData> {
  readonly type: TType;
  readonly data: TData;
}
