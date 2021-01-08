import { pipe } from 'fp-ts/lib/pipeable';
import { Either, mapLeft, getOrElseW } from 'fp-ts/lib/Either';
import { Type } from 'io-ts';
import { TypeCheckingError } from './TypeCheckingError';
import { TypeCheckingService } from './TypeCheckingService';
import { ErrorReporter } from './ErrorReporter';
import { throwErr } from '../Error';

export class TypeCheckingServiceImpl implements TypeCheckingService {
  public constructor(private readonly errorReporter: ErrorReporter) {}

  public check<T>(type: Type<T>, data: unknown): Either<TypeCheckingError, T> {
    return pipe(
      type.decode(data),
      mapLeft(this.errorReporter.report.bind(this.errorReporter)),
      mapLeft(messages => new TypeCheckingError(data, messages)),
    );
  }

  public checkAndThrow<T>(type: Type<T>, data: unknown): T {
    return pipe(this.check(type, data), getOrElseW(throwErr));
  }
}
