import { ReadonlyRecord } from 'fp-ts/ReadonlyRecord';
import { Key } from './Key';

export interface KeyPressingService {
  readonly isPressed: ReadonlyRecord<Key, boolean>;
}
