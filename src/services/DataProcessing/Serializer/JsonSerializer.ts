import { Type } from 'io-ts';

export interface JsonSerializer {
  serialize(object: unknown, pretty?: boolean): string;
  deserialize<A, O = A, I = unknown>(json: string, type: Type<A, O, I>): A;
}
