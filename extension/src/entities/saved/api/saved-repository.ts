import { db } from '@/shared/db';
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

/** Поиск по названию, заголовкам и адресам вкладок, без учёта регистра. */
export function matchesQuery(item: SavedItem, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  if (item.title.toLowerCase().includes(q)) return true;
  return item.window.tabs.some((t) => t.title.toLowerCase().includes(q) || t.url.toLowerCase().includes(q));
}
