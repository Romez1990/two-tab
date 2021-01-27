import { fromEquals } from 'fp-ts/Eq';
import { type, boolean, number, string, undefined, union, TypeOf } from 'io-ts';

export const TabT = type({
  id: number,
  title: string,
  url: string,
  favIconUrl: union([string, undefined]),
  pinned: boolean,
});

export type Tab = TypeOf<typeof TabT>;

export const eqTab = fromEquals((x: Tab, y: Tab): boolean => x.id === y.id);

export const tabsAreEquals = (x: Tab) => (y: Tab): boolean => eqTab.equals(x, y);
