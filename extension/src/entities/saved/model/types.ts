import type { SnapshotWindow } from '@/entities/snapshot/@x/saved';

/**
 * A saved window or group (docs/extension/pages/saved.md, section 1). A group is stored as a window
 * whose tabs are all in one group.
 */
export interface SavedItem {
  id: string;
  kind: 'window' | 'group';
  title: string;
  savedAt: number;
  /** `auto`: closed by auto-close (section 2.5). */
  reason: 'manual' | 'auto';
  window: SnapshotWindow;
}
