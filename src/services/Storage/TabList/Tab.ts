import { fromEquals } from 'fp-ts/Eq';
import { Lens } from 'monocle-ts';
import { TabListEntity } from './TabListEntity';
import { TabEntity } from './TabEntity';

export interface Tab {
  id: number;
  title: string;
  url: string;
  favIconUrl: string | undefined;
  pinned: boolean;
}

export const idLens = Lens.fromProp<Tab>()('id');

export const eqTab = fromEquals((x: Tab, y: Tab): boolean => x.id === y.id);

export const tabsAreEquals = (x: Tab) => (y: Tab): boolean => eqTab.equals(x, y);

export const toTabEntity = ({ id }: TabListEntity) => (tab: Tab): TabEntity => ({
  ...tab,
  tabListId: id,
});

export const fromTabEntity = ({ tabListId, ...tab }: TabEntity): Tab => tab;
