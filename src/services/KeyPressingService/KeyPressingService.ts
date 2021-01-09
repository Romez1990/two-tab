import { ReadonlyRecord } from 'fp-ts/ReadonlyRecord';
import { KeyState } from './KeyState';
import { Key } from './Key';

export interface KeyPressingService {
  readonly keyStates: ReadonlyRecord<Key, KeyState>;
}
