import { NetworkError } from './NetworkError';

export class NoConnectionError extends NetworkError {
  public constructor() {
    super();
  }
}
