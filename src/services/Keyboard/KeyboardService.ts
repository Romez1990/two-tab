import { Key } from './Key';

export interface KeyboardService {
  isPressed(key: Key): boolean;
}
