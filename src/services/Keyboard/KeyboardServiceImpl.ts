import { pipe } from 'fp-ts/function';
import { hasOwnProperty } from 'fp-ts/Record';
import { ReadonlyRecord } from 'fp-ts/ReadonlyRecord';
import { map } from 'fp-ts/ReadonlyArray';
import { KeyboardService } from './KeyboardService';
import { Key } from './Key';
import { KeyNotRegisteredError } from './Errors';

export class KeyboardServiceImpl implements KeyboardService {
  public constructor(window: Window) {
    this.keyPressed = this.createIsPressedRecord();
    window.addEventListener('keydown', this.onKeyDown.bind(this));
    window.addEventListener('keyup', this.onKeyUp.bind(this));
  }

  private readonly keyPressed: Record<Key, boolean | undefined>;

  private createIsPressedRecord(): ReadonlyRecord<Key, boolean> {
    const keys: ReadonlyArray<Key> = ['control', 'shift'];
    const initValues = false;
    return pipe(
      keys,
      map(key => [key, initValues]),
      entries => Object.fromEntries(entries),
    );
  }

  public isPressed(key: Key): boolean {
    const isPressed = this.keyPressed[key];
    if (typeof isPressed === 'undefined') throw new KeyNotRegisteredError(key);
    return isPressed;
  }

  private onKeyDown(e: KeyboardEvent): void {
    const key = this.changeKeyName(e.key);
    if (!hasOwnProperty(key, this.keyPressed)) return;
    this.keyPressed[key] = true;
  }

  private onKeyUp(e: KeyboardEvent): void {
    const key = this.changeKeyName(e.key);
    if (!hasOwnProperty(key, this.keyPressed)) return;
    this.keyPressed[key] = false;
  }

  private changeKeyName = (key: string): Key => key.toLowerCase() as Key;
}
