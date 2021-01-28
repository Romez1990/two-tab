import { pipe } from 'fp-ts/function';
import { fromEquals } from 'fp-ts/Eq';
import { ReadonlyNonEmptyArray, map } from 'fp-ts/ReadonlyNonEmptyArray';
import { Lens } from 'monocle-ts';
import { Tab, toStoredTab } from './Tab';
import { StoredTabList } from './StoredTabList';
import { StoredTab } from './StoredTab';

export interface TabList {
  readonly id: number;
  readonly name: string;
  readonly createdAt: Date;
  readonly tabs: ReadonlyNonEmptyArray<Tab>;
}

export const eqTabList = fromEquals((x: TabList, y: TabList): boolean => {
  if (typeof x.id === 'undefined' || typeof y.id === 'undefined') {
    throw new Error();
  }
  return x.id === y.id;
});

export const tabListsAreEquals = (x: TabList) => (y: TabList): boolean => eqTabList.equals(x, y);

export const tabsLens = Lens.fromProp<TabList>()('tabs');

export const toStoredTabListAndTabs = ({
  tabs,
  ...storedTabList
}: TabList): [StoredTabList, ReadonlyNonEmptyArray<StoredTab>] =>
  pipe(
    tabs,
    map(toStoredTab(storedTabList)),
    storedTabs => [storedTabList, storedTabs],
    //
  );
