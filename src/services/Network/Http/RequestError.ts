import { AppError } from '../../Infrastructure/Error';

export class RequestError extends AppError {
  public constructor() {
    super('');
  }
}
