import { Type } from 'io-ts';
import { StoredTabList } from '../../TabList/StoredTabList';
import { StoredTab } from '../../TabList/StoredTab';
import { StoredTabListToCreate } from '../../TabList/StoredTabListToCreate';
import { StoredTabToCreate } from '../../TabList/StoredTabToCreate';

export interface DataExporter<A, O = A> {
  readonly exportedDataType: Type<A, O>;
  serialize(storedTabLists: ReadonlyArray<StoredTabList>, storedTabs: ReadonlyArray<StoredTab>): A;
  deserialize(
    serializedTabLists: A,
  ): [
    ReadonlyArray<StoredTabListToCreate>,
    (storedTabLists: ReadonlyArray<StoredTabList>) => ReadonlyArray<StoredTabToCreate>,
  ];
}
