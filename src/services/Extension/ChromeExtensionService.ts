import { ExtensionService } from './ExtensionService';

export class ChromeExtensionService implements ExtensionService {
  public getURL = (path: string): string => chrome.extension.getURL(path);
}
