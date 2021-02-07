import { AppError } from '../../../Infrastructure/Error';

export abstract class NetworkError extends AppError {
  protected constructor(message: string) {
    super(message);
  }
}
