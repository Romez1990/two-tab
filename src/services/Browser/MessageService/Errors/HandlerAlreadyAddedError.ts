import { AppError } from '../../../Infrastructure/Error';
import { MessageType } from '../MessageType';

export class HandlerAlreadyAddedError extends AppError {
  public constructor(public readonly messageType: MessageType) {
    super(`Handler for "${messageType}" message type is already added`);
  }
}
