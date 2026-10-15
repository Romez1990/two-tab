import createClient from 'openapi-fetch';
import type { components, paths } from './schema';

/**
 * Client of the local Tidy Reel service (docs/extension/technologies.md, section 2.6). The service listens
 * only on 127.0.0.1; the port is set in settings. Types come from the contract copy `api/local-service.openapi.yaml`.
 */
export type LocalServiceSchemas = components['schemas'];
export type LocalServiceClient = ReturnType<typeof localServiceClient>;

export function localServiceClient(port: number, key?: string) {
  return createClient<paths>({
    baseUrl: `http://127.0.0.1:${port}`,
    headers: key ? { Authorization: `Bearer ${key}` } : {},
  });
}
