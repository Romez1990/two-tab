export interface Tab {
  readonly id: number;
  readonly windowId: number;
  readonly title: string;
  readonly url: string;
  readonly favIconUrl?: string;
  readonly pinned: boolean;
}
