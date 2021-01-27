export interface StoredTabToCreate {
  readonly title: string;
  readonly url: string;
  readonly favIconUrl: string | undefined;
  readonly pinned: boolean;
  readonly tabListId: number;
}
