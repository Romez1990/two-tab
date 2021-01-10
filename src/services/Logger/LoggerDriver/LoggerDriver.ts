export interface LoggerDriver {
  log(...data: ReadonlyArray<unknown>): void;
}
