import { pipe } from 'fp-ts/function';
import { map, filter, last, compact } from 'fp-ts/ReadonlyArray';
import { Option, map as mapO } from 'fp-ts/Option';
import { Errors, ContextEntry, ValidationError } from 'io-ts';
import { join } from '../Utils/fp-ts/ReadonlyArray';
import { ErrorReporter } from './ErrorReporter';
import { JsonSerializer } from '../Serializer';

export class ErrorReporterImpl implements ErrorReporter {
  public constructor(private readonly jsonSerializer: JsonSerializer) {}

  public report = (errs: Errors): ReadonlyArray<string> => pipe(errs, map(this.getMessage.bind(this)), compact);

  private getMessage({ context, value }: ValidationError): Option<string> {
    const path = this.getPath(context);
    return pipe(
      context,
      last,
      mapO(errorContext => {
        const expectedType = errorContext.type.name;
        const atPath = path === '' ? '' : ` at ${path}`;
        const valueJson = this.jsonSerializer.serialize(value, true);
        return `Expecting ${expectedType}${atPath} but instead got: ${valueJson}`;
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
