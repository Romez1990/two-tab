import { ReadonlyNonEmptyArray } from 'fp-ts/ReadonlyNonEmptyArray';
import { TabListEntityToCreate } from './TabListEntityToCreate';
import { WithId } from '../Storage';
import { Tab } from './Tab';
import { TabList } from './TabList';

export type TabListEntity = WithId & TabListEntityToCreate;

export const toTabList = (tabListEntity: TabListEntity) => (tabs: ReadonlyNonEmptyArray<Tab>): TabList => ({
  ...tabListEntity,
  tabs,
});
