import { Errors } from 'io-ts';

export interface ErrorReporter {
  report(errs: Errors): ReadonlyArray<string>;
}
