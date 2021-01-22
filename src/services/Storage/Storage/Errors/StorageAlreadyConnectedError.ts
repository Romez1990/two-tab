import { AppError } from '../../../Infrastructure/Error';

export class StorageAlreadyConnectedError extends AppError {
  public constructor() {
    super('Storage is already connected');
  }
}
