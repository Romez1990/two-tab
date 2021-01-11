import { AppError } from '../../../Error';
import { ChromeWindow } from '../ChromeWindow';

export class InvalidChromeWindowError extends AppError {
  public constructor(public readonly window: ChromeWindow) {
    super('Invalid chrome window');
  }
}
