import { ReadonlyNonEmptyArray } from 'fp-ts/ReadonlyNonEmptyArray';
import { StoredTabListToCreate } from './StoredTabListToCreate';
import { WithId } from '../Storage';
import { Tab } from './Tab';
import { TabList } from './TabList';

export type StoredTabList = WithId & StoredTabListToCreate;

export const toTabList = (storedTabList: StoredTabList) => (tabs: ReadonlyNonEmptyArray<Tab>): TabList => ({
  ...storedTabList,
  tabs,
});
