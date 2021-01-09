import { AppError } from '../../../Error';
import { ChromeTab } from '../ChromeTab';

export class InvalidChromeTabError extends AppError {
  public constructor(public readonly tab: ChromeTab) {
    super('Invalid chrome tab');
  }
}
