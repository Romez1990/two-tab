import { fromEquals } from 'fp-ts/Eq';
import { StoredTabList } from './StoredTabList';
import { StoredTab } from './StoredTab';

export interface Tab {
  id: number;
  title: string;
  url: string;
  favIconUrl: string | undefined;
  pinned: boolean;
}

export const eqTab = fromEquals((x: Tab, y: Tab): boolean => x.id === y.id);

export const tabsAreEquals = (x: Tab) => (y: Tab): boolean => eqTab.equals(x, y);

export const toStoredTab = ({ id }: StoredTabList) => (tab: Tab): StoredTab => ({
  ...tab,
  tabListId: id,
});
