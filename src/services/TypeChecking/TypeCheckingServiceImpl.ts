import { pipe } from 'fp-ts/function';
import { Either, mapLeft, getOrElseW } from 'fp-ts/Either';
import { Type } from 'io-ts';
import { TypeCheckingError } from './TypeCheckingError';
import { TypeCheckingService } from './TypeCheckingService';
import { ErrorReporter } from './ErrorReporter';
import { throwError } from '../Error';

export class TypeCheckingServiceImpl implements TypeCheckingService {
  public constructor(private readonly errorReporter: ErrorReporter) {}

  public check = <T>(type: Type<T>) => (data: unknown): Either<TypeCheckingError, T> =>
    pipe(
      type.decode(data),
      mapLeft(this.errorReporter.report.bind(this.errorReporter)),
      mapLeft(messages => new TypeCheckingError(data, messages)),
    );

  public checkAndThrow = <T>(type: Type<T>) => (data: unknown): T =>
    pipe(
      this.check(type)(data),
      getOrElseW(throwError),
      //
    );
}
