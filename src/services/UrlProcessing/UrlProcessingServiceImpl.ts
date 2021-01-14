import { pipe } from 'fp-ts/function';
import { UrlProcessingService } from './UrlProcessingService';
import { StringProcessingService } from '../StringProcessing';

export class UrlProcessingServiceImpl implements UrlProcessingService {
  public constructor(private readonly stringProcessingService: StringProcessingService) {}

  public getHostName = (url: string): string =>
    pipe(this.createUrlObject(url), ({ hostname }) => hostname, this.stringProcessingService.trimStart('www.'));

  private createUrlObject = (url: string): URL => new URL(url);
}
