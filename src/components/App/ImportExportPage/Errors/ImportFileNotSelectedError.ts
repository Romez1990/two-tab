import { AppError } from '../../../../services/Infrastructure/Error';

export class ImportFileNotSelectedError extends AppError {
  public constructor() {
    super('Import file is not selected');
  }
}
