import { Type } from 'io-ts';
import { Either } from 'fp-ts/lib/Either';
import { TypeCheckingError } from './TypeCheckingError';

export interface TypeCheckingService {
  check<T>(type: Type<T>, data: unknown): Either<TypeCheckingError, T>;
  checkAndThrow<T>(type: Type<T>, data: unknown): T;
}
