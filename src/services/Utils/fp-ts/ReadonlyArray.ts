import { isNonEmpty } from 'fp-ts/ReadonlyArray';
import { ReadonlyNonEmptyArray } from 'fp-ts/ReadonlyNonEmptyArray';
import { ArrayIsEmptyError } from './Errors';

export const join = (separator: string) => (arr: ReadonlyArray<unknown>): string => arr.join(separator);

export const checkNonEmpty = <T>(arrayName: string) => (array: ReadonlyArray<T>): ReadonlyNonEmptyArray<T> =>
  isNonEmpty(array) ? array : new ArrayIsEmptyError(arrayName).throw();
