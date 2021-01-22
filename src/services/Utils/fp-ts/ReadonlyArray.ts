import { pipe } from 'fp-ts/function';
import { isNonEmpty, lookup } from 'fp-ts/ReadonlyArray';
import { ReadonlyNonEmptyArray } from 'fp-ts/ReadonlyNonEmptyArray';
import { getOrElseW } from 'fp-ts/Option';
import { ArrayIsEmptyError, IndexOutOfRangeError } from './Errors';

export const join = (separator: string) => (arr: ReadonlyArray<unknown>): string => arr.join(separator);

export const checkNonEmpty = <T>(arrayName: string) => (array: ReadonlyArray<T>): ReadonlyNonEmptyArray<T> =>
  isNonEmpty(array) ? array : new ArrayIsEmptyError(arrayName).throw();

export const unsafeLookup = <T>(index: number, array: ReadonlyArray<T>): T =>
  pipe(
    lookup(index, array),
    getOrElseW(() => new IndexOutOfRangeError(index, array).throw()),
  );
