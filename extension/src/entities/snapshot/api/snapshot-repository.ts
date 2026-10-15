import { db } from '@/shared/db';
import { snapshotsToDelete } from '../model/retention';
import type { Snapshot } from '../model/types';

const CURRENT_KEY = 'currentSnapshot';

export async function saveCurrentSnapshot(snapshot: Snapshot): Promise<void> {
  await db.meta.put({ key: CURRENT_KEY, value: snapshot });
}

export async function listHistory(): Promise<Snapshot[]> {
  const rows = await db.snapshots.orderBy('takenAt').reverse().toArray();
  return rows as unknown as Snapshot[];
}

export async function archiveCurrentSnapshot(): Promise<void> {
  const current = await getCurrentSnapshot();
  if (current) await archiveSnapshot(current);
}

export async function getCurrentSnapshot(): Promise<Snapshot | undefined> {
  const row = await db.meta.get(CURRENT_KEY);
  return row?.value as Snapshot | undefined;
}

/**
 * Copies the snapshot to history if the windows changed since their last copy, and prunes history by age.
 * Called every 10 minutes, on Chrome start and before a restore.
 */
export async function archiveSnapshot(snapshot: Snapshot, now = Date.now()): Promise<void> {
  const last = await db.snapshots.orderBy('takenAt').last();
  if (!last || last.takenAt < snapshot.takenAt) {
    const { id: _id, ...copy } = snapshot;
    await db.snapshots.add(copy);
  }
  const all = await db.snapshots.toArray();
  const toDelete = snapshotsToDelete(
    all.flatMap((s) => (s.id === undefined ? [] : [{ id: s.id, takenAt: s.takenAt }])),
    now,
  );
  if (toDelete.length > 0) await db.snapshots.bulkDelete(toDelete);
}
