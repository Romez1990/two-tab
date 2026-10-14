import createClient from 'openapi-fetch';
import type { components, paths } from './schema';

/**
 * Клиент локального сервиса Tidy Reel (docs/extension/technologies.md, раздел 2.6). Сервис слушает
 * только 127.0.0.1; порт задаётся в настройках. Типы — из копии договора `api/local-service.openapi.yaml`.
 */
export type LocalServiceSchemas = components['schemas'];
export type LocalServiceClient = ReturnType<typeof localServiceClient>;

export function localServiceClient(port: number, key?: string) {
  return createClient<paths>({
    baseUrl: `http://127.0.0.1:${port}`,
    headers: key ? { Authorization: `Bearer ${key}` } : {},
  });
}
