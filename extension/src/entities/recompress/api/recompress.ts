import { connectedClient, serviceErrorText, type LocalServiceSchemas } from '@/shared/api';

/** Archive compression queue in the local service (tidy-reel/docs/local_service/local_service.md, section 7.5). */

type S = LocalServiceSchemas;
export type RecompressSnapshot = S['RecompressSnapshot'];
export type RecompressQueue = S['RecompressQueueModel'];
export type Job = S['JobModel'];
export type JobFile = S['JobFileModel'];
export type JobFiles = S['JobFilesModel'];
export type JobCheck = S['local_service__routes__recompress__CheckResponse'];
export type FileCheck = S['FileCheckModel'];

export type JobAction = 'pause' | 'resume' | 'cancel' | 'up' | 'down';

/** What happens to each file of the folder, and per-file warnings, before the job is created. */
export async function checkJob(folder: string, preset: string, edits: Record<string, unknown> | null): Promise<JobCheck> {
  return unwrap(await (await client()).POST('/api/recompress/check', { body: { folder, preset, edits } }));
}

function unwrap<T>(result: { data?: T; error?: unknown; response: Response }): T {
  if (result.data === undefined) throw new Error(serviceErrorText(result.response.status, result.error));
  return result.data;
}

async function client() {
  const c = await connectedClient();
  if (!c) throw new Error('Профиль не подключён к Tidy Reel (Настройки)');
  return c;
}

export async function createJob(folder: string, preset: string, edits: Record<string, unknown> | null, confirmed: string[], start: boolean): Promise<Job> {
  return unwrap(await (await client()).POST('/api/recompress', { body: { folder, preset, edits, confirmed, start } }));
}

export async function nextItem(kind: string, after: number | null, filters: readonly string[]): Promise<{ id: number; page: number } | null> {
  return unwrap(await (await client()).GET('/api/recompress/items/next', { params: { query: { kind, after: after ?? undefined, filter: filters.join(',') } } }));
}

export async function pauseQueue(paused: boolean): Promise<void> {
  done(await (await client()).PUT('/api/recompress/pause', { body: { paused } }));
}

function done(result: { error?: unknown; response: Response }): void {
  if (!result.response.ok) throw new Error(serviceErrorText(result.response.status, result.error));
}

export async function readMessage(id: number): Promise<void> {
  done(await (await client()).POST('/api/recompress/messages/{message_id}/read', { params: { path: { message_id: id } } }));
}

export async function jobAction(id: number, action: JobAction): Promise<void> {
  const c = await client();
  const path = { params: { path: { job_id: id } } };
  if (action === 'pause' || action === 'resume') return done(await c.POST('/api/recompress/{job_id}/pause', { ...path, body: { paused: action === 'pause' } }));
  if (action === 'cancel') return done(await c.POST('/api/recompress/{job_id}/cancel', path));
  done(await c.POST('/api/recompress/{job_id}/move', { ...path, body: { steps: action === 'up' ? -1 : 1 } }));
}

/** "Retry" and "Skip" on a failed file. */
export async function fileAction(id: number, action: 'retry' | 'skip'): Promise<void> {
  const c = await client();
  const path = { params: { path: { file_id: id } } };
  done(await c.POST(action === 'retry' ? '/api/recompress/files/{file_id}/retry' : '/api/recompress/files/{file_id}/skip', path));
}
