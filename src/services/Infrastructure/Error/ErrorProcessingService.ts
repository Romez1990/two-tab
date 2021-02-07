import { Option } from 'fp-ts/Option';

export interface ErrorProcessingService {
  refine(error: unknown): Error;
  getHeader(error: Error): string;
  toJson(error: Error): Option<string>;
  getTrace(error: Error): Option<string>;
}
