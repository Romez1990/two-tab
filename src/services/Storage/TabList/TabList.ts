import { pipe } from 'fp-ts/function';
import { fromEquals } from 'fp-ts/Eq';
import { ReadonlyNonEmptyArray, map } from 'fp-ts/ReadonlyNonEmptyArray';
import { Lens } from 'monocle-ts';
import { Tab, toTabEntity } from './Tab';
import { TabListEntity } from './TabListEntity';
import { TabEntity } from './TabEntity';

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

export const toTabListAndTabEntities = ({
  tabs,
  ...tabListEntity
}: TabList): [TabListEntity, ReadonlyNonEmptyArray<TabEntity>] =>
  pipe(
    tabs,
    map(toTabEntity(tabListEntity)),
    tabEntities => [tabListEntity, tabEntities],
    //
  );
