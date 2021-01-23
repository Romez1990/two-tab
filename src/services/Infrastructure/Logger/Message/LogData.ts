import { LogType } from './LogType';

export interface LogData {
  readonly type: LogType;
  readonly args: ReadonlyArray<unknown>;
}
