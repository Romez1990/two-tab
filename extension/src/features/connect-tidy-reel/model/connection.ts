import { localServiceClient } from '@/shared/api';
import { getSettings, updateSettings } from '@/shared/config';

/**
 * Подключение профиля к локальному сервису Tidy Reel (docs/extension/pages/settings.md, раздел 1):
 * регистрация с номером и названием профиля, проверка связи, отключение. Ключ хранится в `storage.local`.
 */

export type ConnectionStatus =
  | { state: 'none' }
  | { state: 'connected'; name: string; since: string }
  /** Ключ есть, но сервис не ответил: подключение остаётся. */
  | { state: 'unreachable' }
  /** Сервис забыл профиль (отключён командой меню): ключ забыт и здесь. */
  | { state: 'revoked' };

export type ConnectResult =
  | { ok: true; name: string; since: string }
  | { ok: false; reason: 'taken'; name: string }
  | { ok: false; reason: 'unreachable' }
  | { ok: false; reason: 'error'; message: string };

const TAKEN_PREFIX = 'another profile is connected: ';

/** Название уже подключённого профиля из ответа 409. */
export function takenBy(detail: unknown): string {
  return typeof detail === 'string' && detail.startsWith(TAKEN_PREFIX) ? detail.slice(TAKEN_PREFIX.length) : '';
}

export async function connectTidyReel(port: number): Promise<ConnectResult> {
  const settings = await getSettings();
  const profileId = settings.profileId || crypto.randomUUID();
  if (!settings.profileId) await updateSettings({ profileId });
  const name = settings.profileName || 'Без названия';
  let result;
  try {
    result = await localServiceClient(port).POST('/api/connection', { body: { profile_id: profileId, name } });
  } catch {
    return { ok: false, reason: 'unreachable' };
  }
  const { data, error, response } = result;
  if (data) {
    await updateSettings({ localServicePort: port, localServiceKey: data.key });
    return { ok: true, name: data.name, since: data.connected_at };
  }
  if (response.status === 409) return { ok: false, reason: 'taken', name: takenBy((error as { detail?: unknown }).detail) };
  return { ok: false, reason: 'error', message: `${response.status} ${JSON.stringify(error)}` };
}

export async function checkConnection(): Promise<ConnectionStatus> {
  const { localServicePort, localServiceKey } = await getSettings();
  if (!localServiceKey) return { state: 'none' };
  let result;
  try {
    result = await localServiceClient(localServicePort, localServiceKey).GET('/api/connection');
  } catch {
    return { state: 'unreachable' };
  }
  if (result.data) return { state: 'connected', name: result.data.name, since: result.data.connected_at };
  // 401 — сервис не знает этот ключ: профиль отключили в Tidy Reel.
  if (result.response.status === 401) {
    await updateSettings({ localServiceKey: '' });
    return { state: 'revoked' };
  }
  return { state: 'unreachable' };
}

/** Забывает подключение; `false` — сервис не ответил, и в Tidy Reel профиль надо отключить командой меню. */
export async function disconnectTidyReel(): Promise<boolean> {
  const { localServicePort, localServiceKey } = await getSettings();
  let forgotten = false;
  try {
    const { response } = await localServiceClient(localServicePort, localServiceKey).DELETE('/api/connection');
    // 401: сервис уже не знает этот профиль.
    forgotten = response.ok || response.status === 401;
  } catch {
    forgotten = false;
  }
  await updateSettings({ localServiceKey: '' });
  return forgotten;
}
