import { ReadonlyRecord } from 'fp-ts/ReadonlyRecord';
import { hasOwnProperty } from 'fp-ts/Record';
import { pipe } from 'fp-ts/function';
import { map } from 'fp-ts/ReadonlyArray';
import { KeyboardService } from './KeyboardService';
import { Key } from './Key';

export class KeyboardServiceImpl implements KeyboardService {
  public constructor(window: Window) {
    this.isPressed = this.createIsPressedRecord();
    window.addEventListener('keydown', this.onKeyDown.bind(this));
    window.addEventListener('keyup', this.onKeyUp.bind(this));
  }

  public readonly isPressed: Record<Key, boolean>;

  private createIsPressedRecord(): ReadonlyRecord<Key, boolean> {
    const keys: ReadonlyArray<Key> = ['shift'];
    const initValues = false;
    return pipe(
      keys,
      map(key => [key, initValues]),
      entries => Object.fromEntries(entries),
    );
  }

  private onKeyDown(e: KeyboardEvent): void {
    const key = this.changeKeyName(e.key);
    if (!hasOwnProperty(key, this.isPressed)) return;
    this.isPressed[key] = true;
  }

  private onKeyUp(e: KeyboardEvent): void {
    const key = this.changeKeyName(e.key);
    if (!hasOwnProperty(key, this.isPressed)) return;
    this.isPressed[key] = false;
  }

  private changeKeyName = (key: string): Key => key.toLowerCase() as Key;
}
