import { BaseMessage } from '../MessageService/BaseMessage';

const messageType = 'log';

export class LogMessage extends BaseMessage<typeof messageType, unknown> {
  public constructor(data: unknown) {
    super(messageType, data);
  }
}
