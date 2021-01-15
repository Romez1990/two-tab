export interface DatetimeService {
  getCurrent(): Date;
  toLocaleString(datetime: Date): string;
}
