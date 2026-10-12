import { describe, expect, it } from 'vitest';
import { pauseAfter, runBySite } from './site-fetch';

describe('pauseAfter', () => {
  it('Retry-After в секундах и датой', () => {
    expect(pauseAfter('120', 1)).toBe(120_000);
    expect(pauseAfter(new Date(61_000).toUTCString(), 1, 1_000)).toBe(60_000);
  });

  it('без Retry-After — 5 минут, каждая следующая пауза вдвое дольше', () => {
    expect(pauseAfter(null, 1)).toBe(300_000);
    expect(pauseAfter(null, 2)).toBe(600_000);
    expect(pauseAfter('мусор', 3)).toBe(1_200_000);
  });
});

describe('runBySite', () => {
  it('адреса одного сайта — по очереди, разные сайты — параллельно', async () => {
    const log: string[] = [];
    const running = new Set<string>();
    let overlapSameSite = false;
    await runBySite(
      ['https://a.com/1', 'https://www.a.com/2', 'https://b.com/1'],
      new AbortController().signal,
      async (url) => {
        const host = new URL(url).hostname.replace(/^www\./, '');
        if (running.has(host)) overlapSameSite = true;
        running.add(host);
        await new Promise((r) => setTimeout(r, 5));
        running.delete(host);
        log.push(url);
      },
    );
    expect(overlapSameSite).toBe(false);
    expect(log).toHaveLength(3);
    expect(log.indexOf('https://a.com/1')).toBeLessThan(log.indexOf('https://www.a.com/2'));
  });
});
