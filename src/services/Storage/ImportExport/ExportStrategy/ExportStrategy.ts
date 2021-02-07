import { Type } from 'io-ts';
import { TabListEntity } from '../../TabList/TabListEntity';
import { TabEntity } from '../../TabList/TabEntity';
import { TabListEntityToCreate } from '../../TabList/TabListEntityToCreate';
import { TabEntityToCreate } from '../../TabList/TabEntityToCreate';

export interface ExportStrategy<A = unknown, O = A> {
  readonly exportedDataType: Type<A, O>;
  serialize(tabListEntities: ReadonlyArray<TabListEntity>, tabEntities: ReadonlyArray<TabEntity>): A;
  deserialize(
    serializedTabLists: A,
  ): [
    ReadonlyArray<TabListEntityToCreate>,
    (tabListEntities: ReadonlyArray<TabListEntity>) => ReadonlyArray<TabEntityToCreate>,
  ];
}
