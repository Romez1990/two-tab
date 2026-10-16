import { getSettings } from '@/shared/config';
import { type LocalServiceClient, localServiceClient } from './client';

/** Client with the port and key from settings; `undefined` means the profile is not connected to Tidy Reel. */
export async function connectedClient(): Promise<LocalServiceClient | undefined> {
  const { localServicePort, localServiceKey } = await getSettings();
  return localServiceKey ? localServiceClient(localServicePort, localServiceKey) : undefined;
}

/** Error text of a service response: FastAPI `detail` or the code. */
export function serviceErrorText(status: number, error: unknown): string {
  const detail = (error as { detail?: unknown } | undefined)?.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) return detail.map((d) => (d as { msg?: string }).msg ?? JSON.stringify(d)).join('; ');
  return `Ошибка ${status}`;
}
