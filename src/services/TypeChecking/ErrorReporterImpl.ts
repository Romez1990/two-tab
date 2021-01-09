import { pipe } from 'fp-ts/function';
import { map, filter, last, compact } from 'fp-ts/ReadonlyArray';
import { Option, map as mapO } from 'fp-ts/Option';
import { Errors, ContextEntry, ValidationError } from 'io-ts';
import { join } from '../Utils/fp-ts/ReadonlyArray';
import { ErrorReporter } from './ErrorReporter';

export class ErrorReporterImpl implements ErrorReporter {
  public report = (errs: Errors): ReadonlyArray<string> => pipe(errs, map(this.getMessage.bind(this)), compact);

  private getMessage(err: ValidationError): Option<string> {
    const { context } = err;
    const path = this.getPath(context);
    return pipe(
      context,
      last,
      mapO(errorContext => {
        const expectedType = errorContext.type.name;
        const atPath = path === '' ? '' : ` at ${path}`;
        const value = JSON.stringify(err.value);
        return `Expecting ${expectedType}${atPath} but instead got: ${value}`;
      }),
    );
  }

  private getPath = (context: ReadonlyArray<ContextEntry>): string =>
    pipe(
      context,
      map(c => c.key),
      filter(key => key.length > 0),
      join('.'),
    );
}
