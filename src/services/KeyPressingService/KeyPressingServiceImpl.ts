import { KeyPressingService } from './KeyPressingService';
import { KeyState } from './KeyState';
import { Key } from './Key';

export class KeyPressingServiceImpl implements KeyPressingService {
  public constructor(window: Window) {
    window.addEventListener('keydown', this.onKeyDown.bind(this));
    window.addEventListener('keyup', this.onKeyUp.bind(this));
  }

  public readonly keyStates: Record<Key, KeyState> = {
    shift: KeyState.NotPressed,
  };

  private onKeyDown(e: KeyboardEvent): void {
    const key = this.changeKeyName(e.key);
    this.keyStates[key] = KeyState.Pressed;
  }

  private onKeyUp(e: KeyboardEvent): void {
    const key = this.changeKeyName(e.key);
    this.keyStates[key] = KeyState.NotPressed;
  }

  private changeKeyName(key: string): Key {
    return key.toLowerCase() as Key;
  }
}
