import { Option } from 'fp-ts/Option';

export interface ErrorProcessingService {
  getHeader(error: Error): string;
  toJson(error: Error): Option<string>;
}
