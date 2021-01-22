export interface DatetimeService {
  getCurrent(): Date;
  toTimeStamp(datetime: Date): number;
  fromTimeStamp(timestamp: number): Date;
  toLocaleString(datetime: Date): string;
}
