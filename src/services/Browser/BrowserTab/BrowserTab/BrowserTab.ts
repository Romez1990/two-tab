import { Lens } from 'monocle-ts';
import { TabToCreate } from '../../../Storage/TabList/TabToCreate';

export interface BrowserTab {
  readonly id: number;
  readonly windowId: number;
  readonly title: string;
  readonly url: string;
  readonly favIconUrl: string | undefined;
  readonly pinned: boolean;
}

export const idLens = Lens.fromProp<BrowserTab>()('id');

export const toTabToCreate = ({ id, windowId, ...tabToCreate }: BrowserTab): TabToCreate => tabToCreate;
