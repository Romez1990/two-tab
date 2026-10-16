import createClient from 'openapi-fetch';
import type { components, paths } from './schema';

/**
 * Client of the local Tidy Reel service (docs/extension/technologies.md, section 2.6). The service listens
 * only on 127.0.0.1; the port is set in settings. Types come from the contract copy `api/local-service.openapi.yaml`.
 */
export type LocalServiceSchemas = components['schemas'];
export type LocalServiceClient = ReturnType<typeof localServiceClient>;

/** The service did not respond: it is not running or the port is wrong. */
export class ServiceUnreachableError extends Error {
  constructor(cause: unknown) {
    super('Локальный сервис Tidy Reel не отвечает', { cause });
  }
}

export function localServiceClient(port: number, key?: string) {
  return createClient<paths>({
    baseUrl: `http://127.0.0.1:${port}`,
    headers: key ? { Authorization: `Bearer ${key}` } : {},
    fetch: fetchService,
  });
}

/** `fetch` rejects with a `TypeError` only when there is no response at all. */
async function fetchService(request: Request): Promise<Response> {
  try {
    return await fetch(request);
  } catch (error) {
    if (error instanceof TypeError) throw new ServiceUnreachableError(error);
    throw error;
  }
}
