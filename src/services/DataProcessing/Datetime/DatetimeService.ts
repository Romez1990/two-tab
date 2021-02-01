export interface DatetimeService {
  getCurrent(): Date;
  toTimeStamp(datetime: Date, withMilliseconds?: boolean): number;
  fromTimeStamp(timestamp: number, withMilliseconds?: boolean): Date;
  toLocaleDatetimeString(datetime: Date): string;
  toLocaleDateString(datetime: Date): string;
  toLocaleTimeString(datetime: Date): string;
}
