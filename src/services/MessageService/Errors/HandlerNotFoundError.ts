import { AppError } from '../../Error';
import { MessageType } from '../MessageType';

export class HandlerNotFoundError extends AppError {
  public constructor(public readonly messageType: MessageType) {
    super(`Handler for "${messageType}" message type not found`);
  }
}
