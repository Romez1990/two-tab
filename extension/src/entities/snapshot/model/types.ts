export interface SnapshotTab {
  url: string;
  title: string;
  pinned: boolean;
  active: boolean;
  /** Номер группы в `SnapshotWindow.groups` или -1, если вкладка вне группы. */
  group: number;
}

export interface SnapshotGroup {
  title: string;
  color: string;
  collapsed: boolean;
}

export interface SnapshotWindow {
  /** Постоянный номер окна (docs/extension/specification.md, раздел 3.1). */
  uid: string;
  focused: boolean;
  state: string;
  left?: number;
  top?: number;
  width?: number;
  height?: number;
  tabs: SnapshotTab[];
  groups: SnapshotGroup[];
}

export interface Snapshot {
  id?: number;
  /** Когда окна последний раз менялись. */
  takenAt: number;
  windows: SnapshotWindow[];
}

export function countTabs(windows: readonly SnapshotWindow[]): number {
  return windows.reduce((sum, w) => sum + w.tabs.length, 0);
}
