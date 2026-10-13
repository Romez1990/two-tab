import { connectedClient, errorText, type LocalServiceSchemas } from '@/shared/api';

/** Пресеты сжатия в локальном сервисе (video-analyzer/docs/local_service/local_service.md, раздел 7.3). */
export type Preset = LocalServiceSchemas['PresetResponse'];
export type PresetInput = LocalServiceSchemas['PresetRequest'];

export class PresetsUnavailableError extends Error {}

async function client() {
  const c = await connectedClient();
  if (!c) throw new PresetsUnavailableError('Профиль не подключён к video-analyzer');
  return c;
}

export async function listPresets(): Promise<{ presets: Preset[]; sites: string[] }> {
  const c = await client();
  const [presets, sites] = await Promise.all([c.GET('/api/presets'), c.GET('/api/presets/sites')]);
  if (!presets.data || !sites.data) throw new Error(errorText(presets.response.status, presets.error ?? sites.error));
  return { presets: presets.data, sites: sites.data };
}

/** Сохраняет пресет: новый или на месте прежнего. Ошибка — текст для пользователя. */
export async function savePreset(input: PresetInput, id?: number): Promise<Preset> {
  const c = await client();
  const result = id === undefined ? await c.POST('/api/presets', { body: input }) : await c.PUT('/api/presets/{preset_id}', { params: { path: { preset_id: id } }, body: input });
  if (!result.data) throw new Error(errorText(result.response.status, result.error));
  return result.data;
}

export async function deletePreset(id: number): Promise<void> {
  const c = await client();
  const { response, error } = await c.DELETE('/api/presets/{preset_id}', { params: { path: { preset_id: id } } });
  if (!response.ok) throw new Error(errorText(response.status, error));
}
