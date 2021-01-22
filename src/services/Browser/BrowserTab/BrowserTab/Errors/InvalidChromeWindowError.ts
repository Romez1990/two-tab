import { AppError } from '../../../../Infrastructure/Error';
import { ChromeWindow } from '../ChromeWindow';

export class InvalidChromeWindowError extends AppError {
  public constructor(public readonly window: ChromeWindow | undefined) {
    super('Invalid chrome window');
  }
}
