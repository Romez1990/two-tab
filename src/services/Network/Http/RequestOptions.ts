import { ReadonlyRecord } from 'fp-ts/ReadonlyRecord';

export type Method = 'get' | 'post' | 'put' | 'patch' | 'delete';

export interface RequestOptions {
  readonly method: Method;
  readonly url: string;
  readonly headers?: ReadonlyRecord<string, string>;
  readonly body?: unknown;
}
