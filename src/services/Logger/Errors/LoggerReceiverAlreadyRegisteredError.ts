import { AppError } from '../../Error';

export class LoggerReceiverAlreadyRegisteredError extends AppError {
  public constructor() {
    super('Logger is already registered as receiver');
  }
}
