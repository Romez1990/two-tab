import { pipe } from 'fp-ts/function';
import { DatetimeService } from './DatetimeService';

type DateTimeFormat = Intl.DateTimeFormat;

export class DatetimeServiceImpl implements DatetimeService {
  public constructor() {
    this.dateTimeFormat = new Intl.DateTimeFormat([], {
      year: '2-digit',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  private readonly dateTimeFormat: DateTimeFormat;

  public getCurrent = (): Date => new Date();

  public toLocaleString = (datetime: Date): string => this.dateTimeFormat.format(datetime);

  public fromTimeStamp = (timestamp: number): Date =>
    pipe(
      timestamp * 1000,
      time => new Date(time),
      //
    );

  public toTimeStamp = (datetime: Date): number =>
    pipe(
      datetime.getTime(),
      time => time / 1000,
      Math.round,
      //
    );
}
