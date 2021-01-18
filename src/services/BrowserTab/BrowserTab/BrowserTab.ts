import { Lens } from 'monocle-ts';

export interface BrowserTab {
  readonly id: number;
  readonly windowId: number;
  readonly title: string;
  readonly url: string;
  readonly favIconUrl?: string;
  readonly pinned: boolean;
}

export const idLens = Lens.fromProp<BrowserTab>()('id');
