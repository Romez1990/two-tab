import { fromEquals } from 'fp-ts/Eq';

export interface Tab {
  readonly id?: number;
  readonly title: string;
  readonly url: string;
  readonly favIconUrl?: string;
  readonly pinned: boolean;
}

export const eqTab = fromEquals((x: Tab, y: Tab): boolean => {
  if (typeof x.id === 'undefined' || typeof y.id === 'undefined') {
    throw new Error();
  }
  return x.id === y.id;
});

export const tabsAreEquals = (x: Tab) => (y: Tab): boolean => eqTab.equals(x, y);
