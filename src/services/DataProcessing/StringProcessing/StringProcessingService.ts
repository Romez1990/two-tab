export interface StringProcessingService {
  trimStart(stringPart: string): (string: string) => string;
}
