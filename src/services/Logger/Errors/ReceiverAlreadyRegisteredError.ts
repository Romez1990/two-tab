import { AppError } from '../../Error';

export class ReceiverAlreadyRegisteredError extends AppError {
  public constructor() {
    super('Logger is already registered as receiver');
  }
}
