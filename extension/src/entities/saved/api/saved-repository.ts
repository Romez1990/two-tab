import { db } from '@/shared/db';
import { browser } from '@/shared/browser';
import { findMatches, type SavedMatch } from '../model/match-url';
import type { SavedItem } from '../model/types';

export async function addSaved(item: SavedItem): Promise<void> {
  await db.saved.put({ ...item });
}

export async function getSaved(id: string): Promise<SavedItem | undefined> {
  return (await db.saved.get(id)) as SavedItem | undefined;
}

export async function listSaved(): Promise<SavedItem[]> {
  return (await db.saved.orderBy('savedAt').reverse().toArray()) as unknown as SavedItem[];
}

export async function deleteSaved(id: string): Promise<void> {
  await db.saved.delete(id);
}

/** Search by name, tab titles and addresses, case-insensitive. */
export function matchesQuery(item: SavedItem, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  if (item.title.toLowerCase().includes(q)) return true;
  return item.window.tabs.some((t) => t.title.toLowerCase().includes(q) || t.url.toLowerCase().includes(q));
}

/** Adds the records that are not there yet (by record id). */
export async function importSaved(items: readonly SavedItem[]): Promise<{ added: number; skipped: number }> {
  return db.transaction('rw', db.saved, async () => {
    const existing = new Set((await db.saved.bulkGet(items.map((i) => i.id))).flatMap((r) => (r ? [r.id] : [])));
    const fresh = items.filter((i, n) => !existing.has(i.id) && items.findIndex((x) => x.id === i.id) === n);
    await db.saved.bulkAdd(fresh.map((i) => ({ ...i })));
    return { added: fresh.length, skipped: items.length - fresh.length };
  });
}

/** Saved windows and groups that have a tab with this address. */
export async function findSavedByUrl(url: string): Promise<SavedMatch[]> {
  return findMatches(await listSaved(), url);
}

/** Address of the "Saved" page with record `id` expanded and the tab with address `tabUrl` highlighted. */
export function savedItemPageUrl(id: string, tabUrl?: string): string {
  const tab = tabUrl ? `/${encodeURIComponent(tabUrl)}` : '';
  return `${browser.runtime.getURL('/app.html')}#saved/${encodeURIComponent(id)}${tab}`;
}
