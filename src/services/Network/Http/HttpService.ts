import { Type } from 'io-ts';
import { TaskEither } from 'fp-ts/TaskEither';
import { NetworkError } from './Errors';

export interface HttpService {
  get<T>(url: string, type: Type<T>, auth?: boolean): TaskEither<NetworkError, T>;
  post<T>(url: string, type: Type<T>, body?: unknown, auth?: boolean): TaskEither<NetworkError, T>;
  put<T>(url: string, type: Type<T>, body?: unknown, auth?: boolean): TaskEither<NetworkError, T>;
  patch<T>(url: string, type: Type<T>, body?: unknown, auth?: boolean): TaskEither<NetworkError, T>;
  delete<T>(url: string, type: Type<T>, auth?: boolean): TaskEither<NetworkError, T>;
}
