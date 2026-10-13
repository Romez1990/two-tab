import { DAY, dayKey, hourKey, monthKey } from '@/shared/lib';

/**
 * Какие снимки истории удалить (docs/extension/pages/recovery.md, раздел 1):
 * до суток — все, до 7 дней — один за час, до 30 дней — один за день, старше — один за месяц.
 * В каждом промежутке остаётся самый поздний снимок.
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
