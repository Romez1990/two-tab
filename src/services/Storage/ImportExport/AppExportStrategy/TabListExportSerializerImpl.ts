import { pipe } from 'fp-ts/function';
import { map as mapA, filter, zipWith, unzip, flatten } from 'fp-ts/ReadonlyArray';
import { map as mapAN, ReadonlyNonEmptyArray } from 'fp-ts/ReadonlyNonEmptyArray';
import { ExportedTabList } from './ExportedTabList';
import { TabListExportSerializer } from './TabListExportSerializer';
import { DatetimeService } from '../../../DataProcessing/Datetime';
import { checkNonEmpty } from '../../../Utils/fp-ts/ReadonlyArray';
import { ExportedTab } from './ExportedTab';
import { TabExportSerializer } from './TabExportSerializer';
import { TabListEntity } from '../../TabList/TabListEntity';
import { belongsToTabList, TabEntity } from '../../TabList/TabEntity';
import { TabListEntityToCreate } from '../../TabList/TabListEntityToCreate';
import { TabEntityToCreate } from '../../TabList/TabEntityToCreate';

export class TabListExportSerializerImpl implements TabListExportSerializer {
  public constructor(
    private readonly tabExportSerializer: TabExportSerializer,
    private readonly datetimeService: DatetimeService,
  ) {}

  public serialize = (
    tabListEntities: ReadonlyArray<TabListEntity>,
    tabEntities: ReadonlyArray<TabEntity>,
  ): ReadonlyArray<ExportedTabList> =>
    pipe(
      tabListEntities,
      mapA(tabListEntity =>
        pipe(
          tabEntities,
          filter(belongsToTabList(tabListEntity)),
          checkNonEmpty('tabs'),
          mapAN(this.tabExportSerializer.serialize.bind(this.tabExportSerializer)),
          this.toSerializedTabList(tabListEntity),
        ),
      ),
    );

  public deserialize = (
    serializedTabLists: ReadonlyArray<ExportedTabList>,
  ): [
    ReadonlyArray<TabListEntityToCreate>,
    (tabListEntities: ReadonlyArray<TabListEntity>) => ReadonlyArray<TabEntityToCreate>,
  ] =>
    pipe(
      serializedTabLists,
      mapA(this.fromSerializedTabList.bind(this)),
      unzip,
      ([tabListEntitiesToCreate, getTabEntityToCreateFunctions]) => [
        tabListEntitiesToCreate,
        tabListEntities =>
          pipe(
            zipWith(tabListEntities, getTabEntityToCreateFunctions, (tabListEntity, getTabEntityToCreate) =>
              getTabEntityToCreate(tabListEntity),
            ),
            flatten,
          ),
      ],
    );

  private toSerializedTabList = ({ id, createdAt, ...tabListEntity }: TabListEntity) => (
    tabs: ReadonlyNonEmptyArray<ExportedTab>,
  ): ExportedTabList => ({
    ...tabListEntity,
    createdAtTimestamp: this.datetimeService.toTimeStamp(createdAt),
    tabs,
  });

  private fromSerializedTabList = ({
    createdAtTimestamp,
    tabs,
    ...serializedTabListEntity
  }: ExportedTabList): [
    TabListEntityToCreate,
    (tabListEntity: TabListEntity) => ReadonlyNonEmptyArray<TabEntityToCreate>,
  ] => [
    {
      ...serializedTabListEntity,
      createdAt: this.datetimeService.fromTimeStamp(createdAtTimestamp),
    },
    tabListEntity =>
      pipe(
        tabs,
        mapAN(this.tabExportSerializer.deserialize(tabListEntity)),
        //
      ),
  ];
}
