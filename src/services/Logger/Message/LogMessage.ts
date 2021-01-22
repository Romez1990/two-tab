import { BaseMessage } from '../../MessageService';
import { LogData } from './LogData';
import { LogType } from './LogType';

const messageType = 'log';

export class LogMessage extends BaseMessage<typeof messageType, LogData> {
  public constructor(type: LogType, args: ReadonlyArray<unknown>) {
    super(messageType, { type, args });
  }
}
