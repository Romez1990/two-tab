import { describe, expect, it } from 'vitest';
import { takenBy } from './connection';

describe('takenBy', () => {
  it('reads the connected profile name from a 409 response', () => {
    expect(takenBy('another profile is connected: Работа')).toBe('Работа');
    expect(takenBy('другое')).toBe('');
    expect(takenBy(undefined)).toBe('');
  });
});
