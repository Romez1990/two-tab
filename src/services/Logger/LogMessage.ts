import { Message } from '../MessageService';

export class LogMessage extends Message<unknown> {
  public constructor(data: unknown) {
    super(data);
  }
}
