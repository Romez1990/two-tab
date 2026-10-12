import { describe, expect, it } from 'vitest';
import { formatBytes } from './usage';

describe('formatBytes', () => {
  it('байты, килобайты, мегабайты', () => {
    expect(formatBytes(512)).toBe('512 Б');
    expect(formatBytes(1024)).toBe('1,00 КБ');
    expect(formatBytes(49459)).toBe('48,3 КБ');
    expect(formatBytes(13 * 1024 * 1024)).toBe('13,0 МБ');
  });
});
