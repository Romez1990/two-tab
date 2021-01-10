import { BaseMessage } from '../MessageService/BaseMessage';

const messageType = 'log';

export class LogMessage extends BaseMessage<typeof messageType, ReadonlyArray<unknown>> {
  public constructor(data: ReadonlyArray<unknown>) {
    super(messageType, data);
  }
}
