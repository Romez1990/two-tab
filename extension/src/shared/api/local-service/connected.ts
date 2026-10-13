import { getSettings } from '@/shared/config';
import { localServiceClient, type LocalServiceClient } from './client';

/** Клиент с портом и ключом из настроек; `undefined` — профиль не подключён к video-analyzer. */
export async function connectedClient(): Promise<LocalServiceClient | undefined> {
  const { localServicePort, localServiceKey } = await getSettings();
  return localServiceKey ? localServiceClient(localServicePort, localServiceKey) : undefined;
}

/** Текст ошибки ответа сервиса: `detail` FastAPI или код. */
export function errorText(status: number, error: unknown): string {
  const detail = (error as { detail?: unknown } | undefined)?.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) return detail.map((d) => (d as { msg?: string }).msg ?? JSON.stringify(d)).join('; ');
  return `Ошибка ${status}`;
}
