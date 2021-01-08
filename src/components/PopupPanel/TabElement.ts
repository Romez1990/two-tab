import { fromEquals } from 'fp-ts/Eq';
import { Tab } from '../../services/Tab';

export interface TabElement extends Tab {
  checked: boolean;
}

export const toTabElement = (tab: Tab): TabElement => ({
  ...tab,
  checked: false,
});

export const toTab = (tabElement: TabElement): Tab => ({
  id: tabElement.id,
  windowId: tabElement.windowId,
  title: tabElement.title,
  url: tabElement.url,
  favIconUrl: tabElement.favIconUrl,
  pinned: tabElement.pinned,
});

export const eqTab = fromEquals((tab1: TabElement, tab2: TabElement): boolean => tab1.id === tab2.id);
