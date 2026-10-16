export interface WindowTab {
  id: number;
  index: number;
  title: string;
  url: string;
  pinned: boolean;
  /** Chrome group id, or -1 if the tab is not in a group. */
  groupId: number;
}

export interface BrowserWindow {
  id: number;
  focused: boolean;
  state: string;
  left?: number | undefined;
  top?: number | undefined;
  width?: number | undefined;
  height?: number | undefined;
  tabs: WindowTab[];
  groups: WindowGroup[];
}

export interface WindowGroup {
  id: number;
  title: string;
  color: string;
  /** Tabs in the group. */
  size: number;
}
