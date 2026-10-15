import { connectedClient, errorText, type LocalServiceSchemas } from '@/shared/api';

/**
 * Shared by both queues of the local service (tidy-reel/docs/local_service/local_service.md,
 * section 7.6): "Needs your decision" cases and queue settings.
 */

export type AttentionCase = LocalServiceSchemas['CaseModel'];
export type QueueSettings = LocalServiceSchemas['SettingsModel'];

/** Cases the queue waits on the user for; empty when not connected. */
export async function getAttention(): Promise<AttentionCase[]> {
  const c = await connectedClient();
  if (!c) return [];
  const { data, error, response } = await c.GET('/api/attention');
  if (!data) throw new Error(errorText(response.status, error));
  return data;
}

/** "Mute": the sound notification for the current cases no longer plays. */
export async function muteAttention(): Promise<void> {
  const { response, error } = await (await client()).POST('/api/attention/mute');
  if (!response.ok) throw new Error(errorText(response.status, error));
}

async function client() {
  const c = await connectedClient();
  if (!c) throw new Error('Профиль не подключён к Tidy Reel (Настройки)');
  return c;
}

export async function getQueueSettings(): Promise<QueueSettings> {
  const { data, error, response } = await (await client()).GET('/api/settings');
  if (!data) throw new Error(errorText(response.status, error));
  return data;
}

export async function saveQueueSettings(settings: QueueSettings): Promise<QueueSettings> {
  const { data, error, response } = await (await client()).PUT('/api/settings', { body: settings });
  if (!data) throw new Error(errorText(response.status, error));
  return data;
}
