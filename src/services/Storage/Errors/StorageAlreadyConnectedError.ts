import { AppError } from '../../Error';

export class StorageAlreadyConnectedError extends AppError {
  public constructor() {
    super('Storage is already connected');
  }
}
