export interface SnapshotTab {
  url: string;
  title: string;
  pinned: boolean;
  active: boolean;
  /** Group index in `SnapshotWindow.groups`, or -1 if the tab is not in a group. */
  group: number;
}

export interface SnapshotGroup {
  title: string;
  color: string;
  collapsed: boolean;
}

export interface SnapshotWindow {
  /** Permanent window id (docs/extension/specification.md, section 3.1). */
  uid: string;
  focused: boolean;
  state: string;
  left?: number | undefined;
  top?: number | undefined;
  width?: number | undefined;
  height?: number | undefined;
  tabs: SnapshotTab[];
  groups: SnapshotGroup[];
}

export interface Snapshot {
  id?: number;
  /** When the windows last changed. */
  takenAt: number;
  windows: SnapshotWindow[];
}

export function countTabs(windows: readonly SnapshotWindow[]): number {
  return windows.reduce((sum, w) => sum + w.tabs.length, 0);
}
