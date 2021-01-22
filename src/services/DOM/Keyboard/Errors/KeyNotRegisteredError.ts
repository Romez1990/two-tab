import { AppError } from '../../../Infrastructure/Error';
import { Key } from '../Key';

export class KeyNotRegisteredError extends AppError {
  public constructor(public readonly key: Key) {
    super(`Key ${key} is not registered in keyboard service`);
  }
}
