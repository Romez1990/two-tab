export interface LoggerService {
  registerReceiver(): void;
  debug(...args: ReadonlyArray<unknown>): void;
  info(...args: ReadonlyArray<unknown>): void;
  warning(...args: ReadonlyArray<unknown>): void;
  error(...args: ReadonlyArray<unknown>): void;
}
