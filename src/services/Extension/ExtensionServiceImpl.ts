import { ExtensionService } from './ExtensionService';

export class ExtensionServiceImpl implements ExtensionService {
  public getURL(path: string): string {
    return chrome.extension.getURL(path);
  }
}
