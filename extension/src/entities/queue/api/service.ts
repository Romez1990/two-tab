import { connectedClient, serviceErrorText, type LocalServiceSchemas } from '@/shared/api';

/**
 * Shared by both queues of the local service (tidy-reel/docs/local_service/local_service.md,
 * section 7.6): muting the "Needs your decision" cases and queue settings. The cases themselves
 * come over the WebSocket (`attention-store.ts`).
 */

export type QueueSettings = LocalServiceSchemas['SettingsModel'];

/** "Mute": the sound notification for the current cases no longer plays. */
export async function muteAttention(): Promise<void> {
  const { response, error } = await (await client()).POST('/api/attention/mute');
  if (!response.ok) throw new Error(serviceErrorText(response.status, error));
}

async function client() {
  const c = await connectedClient();
  if (!c) throw new Error('Профиль не подключён к Tidy Reel (Настройки)');
  return c;
}

export async function getQueueSettings(): Promise<QueueSettings> {
  const { data, error, response } = await (await client()).GET('/api/settings');
  if (!data) throw new Error(serviceErrorText(response.status, error));
  return data;
}

export async function saveQueueSettings(settings: QueueSettings): Promise<QueueSettings> {
  const { data, error, response } = await (await client()).PUT('/api/settings', { body: settings });
  if (!data) throw new Error(serviceErrorText(response.status, error));
  return data;
}
