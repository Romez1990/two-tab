import { browser } from '@/shared/browser';

/**
 * Постоянные номера окон по номерам Chrome (docs/extension/specification.md, раздел 3.1).
 * Хранятся в `storage.session`: переживают сон фонового скрипта и стираются при перезапуске Chrome,
 * когда номера Chrome всё равно другие.
 */
const KEY = 'windowUids';

export async function getWindowUids(): Promise<Map<number, string>> {
  const stored = (await browser.storage.session.get(KEY))[KEY] as Record<string, string> | undefined;
  return new Map(Object.entries(stored ?? {}).map(([id, uid]) => [Number(id), uid]));
}

export async function setWindowUids(uids: ReadonlyMap<number, string>): Promise<void> {
  await browser.storage.session.set({ [KEY]: Object.fromEntries(uids) });
}

export async function setWindowUid(windowId: number, uid: string): Promise<void> {
  const uids = await getWindowUids();
  uids.set(windowId, uid);
  await setWindowUids(uids);
}

export function newWindowUid(): string {
  return crypto.randomUUID();
}
