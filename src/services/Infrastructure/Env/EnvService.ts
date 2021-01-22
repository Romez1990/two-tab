import { Type } from 'io-ts';

export interface EnvService {
  getString(varName: string): string;
  getBoolean(varName: string): boolean;
  getOfType<T>(varName: string, type: Type<T>): T;
}
