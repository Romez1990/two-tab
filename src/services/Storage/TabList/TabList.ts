import { fromEquals } from 'fp-ts/Eq';
import { ReadonlyNonEmptyArray } from 'fp-ts/ReadonlyNonEmptyArray';
import { Lens } from 'monocle-ts';
import { TabListEntity } from './TabListEntity';
import { Tab } from './Tab';

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

export const fromTabListEntity = (tabListEntity: TabListEntity) => (tabs: ReadonlyNonEmptyArray<Tab>): TabList => ({
  ...tabListEntity,
  tabs,
});
