import { pipe } from 'fp-ts/function';
import { eqString } from 'fp-ts/Eq';
import { filter, elem, isEmpty } from 'fp-ts/ReadonlyArray';
import { Option, some, none, map, fromNullable } from 'fp-ts/Option';
import { ErrorProcessingService } from './ErrorProcessingService';
import { JsonSerializer } from '../../DataProcessing/Serializer';

export class ErrorProcessingServiceImpl implements ErrorProcessingService {
  public constructor(private readonly jsonSerializer: JsonSerializer) {}

  public refine(error: unknown): Error {
    if (!(error instanceof Error)) throw error;
    return error;
  }

  public getHeader(error: Error): string {
    const name = this.getName(error);
    const { message } = error;
    return `${name}: ${message}`;
  }

  private getName = (error: Error): string => (typeof error.name !== 'undefined' ? error.name : error.constructor.name);

  public toJson = (error: Error): Option<string> =>
    pipe(
      Object.entries(error),
      filter(entry => !this.isErrorPropertyName(entry[0])),
      this.entriesOrNone,
      map(Object.fromEntries),
      map(this.jsonSerializer.serialize.bind(this.jsonSerializer)),
    );

  public getTrace = (error: Error): Option<string> => fromNullable(error.stack);

  private readonly errorProperties: ReadonlyArray<string> = ['name', 'message', 'stack'];

  private isErrorPropertyName = (propertyName: string): boolean => elem(eqString)(propertyName, this.errorProperties);

  private entriesOrNone = (entries: ReadonlyArray<[string, unknown]>): Option<ReadonlyArray<[string, unknown]>> =>
    isEmpty(entries) ? none : some(entries);
}
