import { pipe } from 'fp-ts/function';
import { Either, mapLeft, getOrElseW } from 'fp-ts/Either';
import { Type } from 'io-ts';
import { TypeCheckingError } from './TypeCheckingError';
import { TypeCheckingService } from './TypeCheckingService';
import { ErrorReporter } from './ErrorReporter';
import { throwError } from '../../Infrastructure/Error';

export class TypeCheckingServiceImpl implements TypeCheckingService {
  public constructor(private readonly errorReporter: ErrorReporter) {}

  public check = <A, O = A, I = unknown>(type: Type<A, O, I>) => (data: I): Either<TypeCheckingError, A> =>
    pipe(
      type.decode(data),
      mapLeft(this.errorReporter.report.bind(this.errorReporter)),
      mapLeft(messages => new TypeCheckingError(data, messages)),
    );

  public checkAndThrow = <A, O = A, I = unknown>(type: Type<A, O, I>) => (data: I): A =>
    pipe(
      this.check(type)(data),
      getOrElseW(throwError),
      //
    );
}
