import { describe, expect, it } from 'vitest';
import { DEFAULT_QUEUE_STATE, queueStateOfHash, readQueueState, writeQueueState } from './address';
import { formatDuration, formatSize, remainingText } from './format';

describe('queue state in the address', () => {
  it('keeps only what differs from the defaults', () => {
    expect(writeQueueState(DEFAULT_QUEUE_STATE)).toBe('');
    expect(writeQueueState({ filters: ['errors', 'decision'], page: 2 })).toBe('?filter=decision,errors&page=2');
    expect(readQueueState('?filter=decision,errors&page=2')).toEqual({ filters: ['decision', 'errors'], page: 2 });
  });

  it('falls back to the defaults on nonsense', () => {
    expect(readQueueState('?filter=nope&page=-3')).toEqual(DEFAULT_QUEUE_STATE);
    expect(queueStateOfHash('#downloads')).toEqual(DEFAULT_QUEUE_STATE);
    expect(queueStateOfHash('#recompress?page=4').page).toBe(4);
  });
});

describe('remaining', () => {
  const left = { count: 12, counting: false, approximate: false };

  it('writes the count always and the time only when it is known', () => {
    expect(remainingText({ ...left, seconds: 12_000, bytes: 2.3 * 1024 ** 3 }, 'video')).toBe('осталось 12 видео · ≈ 3 ч 20 мин · ≈ 2,3 ГБ');
    expect(remainingText({ ...left, seconds: null, bytes: null }, 'video')).toBe('осталось 12 видео');
    expect(remainingText({ ...left, count: 3, seconds: 60, frees: 12 * 1024 ** 3 }, 'file')).toBe('осталось 3 файла · ≈ 1 мин · ≈ освободится 12 ГБ');
  });

  it('says the channel is being counted', () => {
    expect(remainingText({ count: 0, counting: true, approximate: false }, 'video')).toBe('подсчитывается…');
    expect(remainingText({ count: 2, counting: true, seconds: 60, approximate: false }, 'video')).toBe('осталось 2 видео · подсчитывается…');
    expect(remainingText({ count: 0, counting: false, approximate: false }, 'file')).toBe('ничего не осталось');
  });

  it('formats the time and the size', () => {
    expect(formatDuration(20)).toBe('≈ 1 мин');
    expect(formatDuration(7200)).toBe('≈ 2 ч');
    expect(formatSize(450 * 1024 ** 2)).toBe('450 МБ');
    expect(formatSize(2 * 1024 ** 3)).toBe('2 ГБ');
  });
});
