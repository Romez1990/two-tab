import { browser } from '@/shared/browser';

/**
 * Permanent window ids by Chrome ids (docs/extension/specification.md, section 3.1).
 * Kept in `storage.session`: they survive background script sleep and are cleared on Chrome restart,
 * when the Chrome ids are different anyway.
 */
const KEY = 'windowUids';

export async function setWindowUid(windowId: number, uid: string): Promise<void> {
  const uids = await getWindowUids();
  uids.set(windowId, uid);
  await setWindowUids(uids);
}

export async function getWindowUids(): Promise<Map<number, string>> {
  const stored = (await browser.storage.session.get(KEY))[KEY] as Record<string, string> | undefined;
  return new Map(Object.entries(stored ?? {}).map(([id, uid]) => [Number(id), uid]));
}

export async function setWindowUids(uids: ReadonlyMap<number, string>): Promise<void> {
  await browser.storage.session.set({ [KEY]: Object.fromEntries(uids) });
}

export function newWindowUid(): string {
  return crypto.randomUUID();
}
