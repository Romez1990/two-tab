import { ExtensionService } from './ExtensionService';

export class ChromeExtensionService implements ExtensionService {
  public getURL(path: string): string {
    return chrome.extension.getURL(path);
  }
}
