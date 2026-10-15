import { DAY, dayKey, hourKey, monthKey } from '@/shared/lib';

/**
 * Which history snapshots to delete (docs/extension/pages/recovery.md, section 1):
 * up to a day all of them, up to 7 days one per hour, up to 30 days one per day, older one per month.
 * The latest snapshot of each interval stays.
 */
export function snapshotsToDelete(items: readonly { id: number; takenAt: number }[], now: number): number[] {
  const kept = new Set<string>();
  const toDelete: number[] = [];
  for (const item of [...items].sort((a, b) => b.takenAt - a.takenAt)) {
    const age = now - item.takenAt;
    if (age < DAY) continue;
    const bucket =
      age < 7 * DAY ? `h ${hourKey(item.takenAt)}` : age < 30 * DAY ? `d ${dayKey(item.takenAt)}` : `m ${monthKey(item.takenAt)}`;
    if (kept.has(bucket)) toDelete.push(item.id);
    else kept.add(bucket);
  }
  return toDelete;
}
