import { ReadonlyRecord } from 'fp-ts/ReadonlyRecord';
import { Key } from './Key';

export interface KeyboardService {
  readonly isPressed: ReadonlyRecord<Key, boolean>;
}
