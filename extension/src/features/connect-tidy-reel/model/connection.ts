import { localServiceClient } from '@/shared/api';
import { getSettings, updateSettings } from '@/shared/config';

/**
 * Connecting the profile to the local Tidy Reel service (docs/extension/pages/settings.md, section 1):
 * registration with the profile id and name, connection check, disconnect. The key is kept in `storage.local`.
 */

export type ConnectionStatus =
  | { state: 'none' }
  | { state: 'connected'; name: string; since: string }
  /** There is a key but the service did not respond: the connection stays. */
  | { state: 'unreachable' }
  /** The service forgot the profile (disconnected from the menu): the key is forgotten here too. */
  | { state: 'revoked' };

export type ConnectResult =
  | { ok: true; name: string; since: string }
  | { ok: false; reason: 'taken'; name: string }
  | { ok: false; reason: 'unreachable' }
  | { ok: false; reason: 'error'; message: string };

const TAKEN_PREFIX = 'another profile is connected: ';

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

/** Name of the already connected profile from a 409 response. */
export function takenBy(detail: unknown): string {
  return typeof detail === 'string' && detail.startsWith(TAKEN_PREFIX) ? detail.slice(TAKEN_PREFIX.length) : '';
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
  // 401: the service does not know this key, the profile was disconnected in Tidy Reel.
  if (result.response.status === 401) {
    await updateSettings({ localServiceKey: '' });
    return { state: 'revoked' };
  }
  return { state: 'unreachable' };
}

/** Forgets the connection; `false` means the service did not respond and the profile must be disconnected from the Tidy Reel menu. */
export async function disconnectTidyReel(): Promise<boolean> {
  const { localServicePort, localServiceKey } = await getSettings();
  let forgotten = false;
  try {
    const { response } = await localServiceClient(localServicePort, localServiceKey).DELETE('/api/connection');
    // 401: the service no longer knows this profile.
    forgotten = response.ok || response.status === 401;
  } catch {
    forgotten = false;
  }
  await updateSettings({ localServiceKey: '' });
  return forgotten;
}
