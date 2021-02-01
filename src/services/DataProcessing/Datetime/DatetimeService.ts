export interface DatetimeService {
  getCurrent(): Date;
  toTimeStamp(datetime: Date): number;
  fromTimeStamp(timestamp: number): Date;
  toLocaleDatetimeString(datetime: Date): string;
  toLocaleDateString(datetime: Date): string;
  toLocaleTimeString(datetime: Date): string;
}
