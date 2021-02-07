import { NetworkError } from './NetworkError';

export class HttpError extends NetworkError {
  public constructor(status: number) {
    super();
  }
}
