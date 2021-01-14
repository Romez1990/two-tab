import { UrlProcessingService } from './UrlProcessingService';

export class UrlProcessingServiceImpl implements UrlProcessingService {
  public getHostName = (url: string): string => this.createUrlObject(url).hostname;

  private createUrlObject = (url: string): URL => new URL(url);
}
