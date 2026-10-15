import { connectedClient, errorText, type LocalServiceSchemas } from '@/shared/api';

/**
 * Общее для обеих очередей в локальном сервисе (tidy-reel/docs/local_service/local_service.md,
 * раздел 7.6): случаи «Нужно ваше решение» и настройки очередей.
 */

export type AttentionCase = LocalServiceSchemas['CaseModel'];
export type QueueSettings = LocalServiceSchemas['SettingsModel'];

async function client() {
  const c = await connectedClient();
  if (!c) throw new Error('Профиль не подключён к Tidy Reel (Настройки)');
  return c;
}

/** Случаи, по которым очередь ждёт пользователя; без подключения — пусто. */
export async function getAttention(): Promise<AttentionCase[]> {
  const c = await connectedClient();
  if (!c) return [];
  const { data, error, response } = await c.GET('/api/attention');
  if (!data) throw new Error(errorText(response.status, error));
  return data;
}

/** «Заглушить»: уведомление со звуком по текущим случаям больше не звучит. */
export async function muteAttention(): Promise<void> {
  const { response, error } = await (await client()).POST('/api/attention/mute');
  if (!response.ok) throw new Error(errorText(response.status, error));
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
