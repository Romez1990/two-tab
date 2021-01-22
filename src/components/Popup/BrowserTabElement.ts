import { fromEquals } from 'fp-ts/Eq';
import { readonlyArray } from 'fp-ts/ReadonlyArray';
import { Lens, fromTraversable } from 'monocle-ts';
import { BrowserTab } from '../../services/Browser/BrowserTab';

export interface BrowserTabElement extends BrowserTab {
  readonly checked: boolean;
}

export const toBrowserTabElement = (tab: BrowserTab): BrowserTabElement => ({
  ...tab,
  checked: false,
});

export const toBrowserTab = (tabElement: BrowserTabElement): BrowserTab => {
  const { checked, ...tab } = tabElement;
  return tab;
};

export const eqBrowserTab = fromEquals((x: BrowserTabElement, y: BrowserTabElement): boolean => x.id === y.id);

export const checkedLens = Lens.fromProp<BrowserTabElement>()('checked');
export const tabsTraversal = fromTraversable(readonlyArray)<BrowserTabElement>();
