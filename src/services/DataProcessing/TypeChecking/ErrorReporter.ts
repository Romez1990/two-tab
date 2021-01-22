import { Errors } from 'io-ts';

export interface ErrorReporter {
  report(errors: Errors): ReadonlyArray<string>;
}
