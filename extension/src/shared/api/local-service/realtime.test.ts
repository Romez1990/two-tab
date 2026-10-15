import { describe, expect, it } from 'vitest';
import { FIRST_RETRY_MS, LAST_RETRY_MS, nextRetryDelay } from './realtime';

describe('nextRetryDelay', () => {
  it('starts at 5 seconds and doubles up to a minute', () => {
    expect(nextRetryDelay(null)).toBe(FIRST_RETRY_MS);
    expect(nextRetryDelay(FIRST_RETRY_MS)).toBe(10_000);
    expect(nextRetryDelay(40_000)).toBe(LAST_RETRY_MS);
    expect(nextRetryDelay(LAST_RETRY_MS)).toBe(LAST_RETRY_MS);
  });
});
