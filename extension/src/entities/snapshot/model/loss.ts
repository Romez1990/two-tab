import type { Snapshot, SnapshotTab, SnapshotWindow } from './types';

/** What is missing compared with the previous snapshot. */
export interface Loss {
  /** Windows that are gone completely. */
  windows: SnapshotWindow[];
  /** Tabs missing from windows that remain. */
  tabs: { window: SnapshotWindow; tabs: SnapshotTab[] }[];
}

export function lossSize(loss: Loss): { windows: number; tabs: number } {
  const tabs = loss.windows.reduce((s, w) => s + w.tabs.length, 0) + loss.tabs.reduce((s, x) => s + x.tabs.length, 0);
  return { windows: loss.windows.length, tabs };
}

/** Windows are matched by permanent id, tabs within a window by address (counting repeats). */
export function findLoss(previous: Snapshot, current: readonly SnapshotWindow[]): Loss {
  const byUid = new Map(current.map((w) => [w.uid, w]));
  const loss: Loss = { windows: [], tabs: [] };
  for (const old of previous.windows) {
    const now = byUid.get(old.uid);
    if (!now) {
      loss.windows.push(old);
      continue;
    }
    const left = new Map<string, number>();
    for (const t of now.tabs) left.set(t.url, (left.get(t.url) ?? 0) + 1);
    const missing: SnapshotTab[] = [];
    for (const t of old.tabs) {
      const n = left.get(t.url) ?? 0;
      if (n > 0) left.set(t.url, n - 1);
      else missing.push(t);
    }
    if (missing.length > 0) loss.tabs.push({ window: old, tabs: missing });
  }
  return loss;
}
