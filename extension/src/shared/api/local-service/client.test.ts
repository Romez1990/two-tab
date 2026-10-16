import { afterEach, describe, expect, it, vi } from 'vitest';
import { localServiceClient, ServiceUnreachableError } from './client';

describe('localServiceClient', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('turns a network failure into ServiceUnreachableError', async () => {
    vi.stubGlobal('fetch', () => Promise.reject(new TypeError('Failed to fetch')));
    await expect(localServiceClient(1).GET('/api/connection')).rejects.toBeInstanceOf(ServiceUnreachableError);
  });

  it('passes other errors through', async () => {
    const aborted = new DOMException('aborted', 'AbortError');
    vi.stubGlobal('fetch', () => Promise.reject(aborted));
    await expect(localServiceClient(1).GET('/api/connection')).rejects.toBe(aborted);
  });
});
