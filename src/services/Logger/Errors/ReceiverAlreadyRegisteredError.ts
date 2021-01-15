import { AppError } from '../../Error';

export class ReceiverAlreadyRegisteredError extends AppError {
  public constructor() {
    super('Logger receiver is already registered');
  }
}
