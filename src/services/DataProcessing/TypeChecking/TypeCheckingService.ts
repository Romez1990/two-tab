import { Type } from 'io-ts';
import { Either } from 'fp-ts/Either';
import { TypeCheckingError } from './TypeCheckingError';

export interface TypeCheckingService {
  check<A, O = A, I = unknown>(type: Type<A, O, I>): (data: I) => Either<TypeCheckingError, A>;
  checkAndThrow<A, O = A, I = unknown>(type: Type<A, O, I>): (data: I) => A;
}
