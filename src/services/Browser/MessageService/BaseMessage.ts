import { MessageType } from './MessageType';

export abstract class BaseMessage<TType extends MessageType, TData> {
  protected constructor(public readonly type: TType, public readonly data: TData) {}
}
