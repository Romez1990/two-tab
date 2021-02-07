import { TaskEither } from 'fp-ts/TaskEither';
import { RequestOptions } from './RequestOptions';
import { RequestError } from './RequestError';

export interface RequestService {
  request(options: RequestOptions): TaskEither<RequestError, unknown>;
}
