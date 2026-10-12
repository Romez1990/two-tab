export interface WindowTab {
  id: number;
  index: number;
  title: string;
  url: string;
  pinned: boolean;
  /** Номер группы Chrome или -1, если вкладка вне группы. */
  groupId: number;
}

export interface BrowserWindow {
  id: number;
  focused: boolean;
  state: string;
  left?: number;
  top?: number;
  width?: number;
  height?: number;
  tabs: WindowTab[];
  groups: WindowGroup[];
}

export interface WindowGroup {
  id: number;
  title: string;
  color: string;
  /** Вкладок в группе. */
  size: number;
}
