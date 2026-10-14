import { describe, expect, it } from 'vitest';
import { takenBy } from './connection';

describe('takenBy', () => {
  it('название подключённого профиля из ответа 409', () => {
    expect(takenBy('another profile is connected: Работа')).toBe('Работа');
    expect(takenBy('другое')).toBe('');
    expect(takenBy(undefined)).toBe('');
  });
});
