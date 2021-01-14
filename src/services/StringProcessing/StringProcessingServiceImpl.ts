import { StringProcessingService } from './StringProcessingService';

export class StringProcessingServiceImpl implements StringProcessingService {
  public trimStart = (stringPart: string) => (string: string): string =>
    string.startsWith(stringPart) ? string.slice(stringPart.length) : string;
}
