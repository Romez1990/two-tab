import { fromEquals } from 'fp-ts/Eq';
import { Lens } from 'monocle-ts';
import { BrowserTab } from '../../services/BrowserTab';

export interface TabElement extends BrowserTab {
  readonly checked: boolean;
}

export const toTabElement = (tab: BrowserTab): TabElement => ({
  ...tab,
  checked: false,
});

export const toTab = (tabElement: TabElement): BrowserTab => ({
  id: tabElement.id,
  windowId: tabElement.windowId,
  title: tabElement.title,
  url: tabElement.url,
  favIconUrl: tabElement.favIconUrl,
  pinned: tabElement.pinned,
});

export const eqTab = fromEquals((tab1: TabElement, tab2: TabElement): boolean => tab1.id === tab2.id);

export const checkedLens = Lens.fromProp<TabElement>()('checked');
