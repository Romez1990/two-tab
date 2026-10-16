import { browser } from '@/shared/browser';
import { db } from '@/shared/db';
import { DAY } from '@/shared/lib';

/** A tab closed the usual way (close button, Ctrl+W); kept for 30 days (docs/extension/pages/recovery.md, section 1). */
export interface ClosedTab {
  id?: number;
  url: string;
  title: string;
  closedAt: number;
}

const KEEP_MS = 30 * DAY;

const CLOSING_KEY = 'closingByExtension';

export async function addClosedTab(tab: Omit<ClosedTab, 'id'>): Promise<void> {
  await db.closedTabs.add({ ...tab });
}

export async function listClosedTabs(): Promise<ClosedTab[]> {
  const rows = await db.closedTabs.orderBy('closedAt').reverse().toArray();
  return rows as unknown as ClosedTab[];
}

export async function deleteClosedTab(id: number): Promise<void> {
  await db.closedTabs.delete(id);
}

export async function pruneClosedTabs(now = Date.now()): Promise<void> {
  await db.closedTabs
    .where('closedAt')
    .below(now - KEEP_MS)
    .delete();
}

/** Tabs closed by the extension itself (saving a group, auto-close): they do not go to "Recently closed". */
export async function markClosingByExtension(tabIds: readonly number[]): Promise<void> {
  const stored = ((await browser.storage.session.get(CLOSING_KEY))[CLOSING_KEY] as number[] | undefined) ?? [];
  await browser.storage.session.set({ [CLOSING_KEY]: [...stored, ...tabIds] });
}

/** True if the extension closed the tab; the mark is removed. */
export async function takeClosingByExtension(tabId: number): Promise<boolean> {
  const stored = ((await browser.storage.session.get(CLOSING_KEY))[CLOSING_KEY] as number[] | undefined) ?? [];
  if (!stored.includes(tabId)) return false;
  await browser.storage.session.set({ [CLOSING_KEY]: stored.filter((id) => id !== tabId) });
  return true;
}
