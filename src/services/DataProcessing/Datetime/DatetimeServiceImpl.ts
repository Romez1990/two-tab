import { pipe } from 'fp-ts/function';
import { DatetimeService } from './DatetimeService';

export class DatetimeServiceImpl implements DatetimeService {
  public constructor() {
    const dateOptions: Intl.DateTimeFormatOptions = {
      year: '2-digit',
      month: '2-digit',
      day: '2-digit',
    };
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
    };
    this.dateTimeFormat = new Intl.DateTimeFormat([], { ...dateOptions, ...timeOptions });
    this.dateFormat = new Intl.DateTimeFormat([], dateOptions);
    this.timeFormat = new Intl.DateTimeFormat([], timeOptions);
  }

  private readonly dateTimeFormat: Intl.DateTimeFormat;
  private readonly dateFormat: Intl.DateTimeFormat;
  private readonly timeFormat: Intl.DateTimeFormat;

  public getCurrent = (): Date => new Date();

  public fromTimeStamp = (timestamp: number, withMilliseconds = false): Date =>
    pipe(
      withMilliseconds ? timestamp : timestamp * 1000,
      time => new Date(time),
      //
    );

  public toTimeStamp = (datetime: Date, withMilliseconds = false): number =>
    pipe(
      datetime.getTime(),
      time => (withMilliseconds ? time : Math.round(time / 1000)),
      //
    );

  public toLocaleDatetimeString = (datetime: Date): string => this.dateTimeFormat.format(datetime);

  public toLocaleDateString = (datetime: Date): string => this.dateFormat.format(datetime);

  public toLocaleTimeString = (datetime: Date): string => this.timeFormat.format(datetime);
}
