import { fromEquals } from 'fp-ts/Eq';
import { Lens } from 'monocle-ts';
import { BrowserTab } from '../../services/BrowserTab';

export interface BrowserTabElement extends BrowserTab {
  readonly checked: boolean;
}

export const toBrowserTabElement = (tab: BrowserTab): BrowserTabElement => ({
  ...tab,
  checked: false,
});

export const toBrowserTab = (tabElement: BrowserTabElement): BrowserTab => ({
  id: tabElement.id,
  windowId: tabElement.windowId,
  title: tabElement.title,
  url: tabElement.url,
  favIconUrl: tabElement.favIconUrl,
  pinned: tabElement.pinned,
});

export const eqBrowserTab = fromEquals(
  (tab1: BrowserTabElement, tab2: BrowserTabElement): boolean => tab1.id === tab2.id,
);

export const checkedLens = Lens.fromProp<BrowserTabElement>()('checked');
