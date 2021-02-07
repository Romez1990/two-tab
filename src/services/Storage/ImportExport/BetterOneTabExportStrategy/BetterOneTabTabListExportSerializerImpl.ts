import { pipe } from 'fp-ts/function';
import { filter, flatten, map as mapA, unzip, zipWith } from 'fp-ts/ReadonlyArray';
import { map as mapAN, ReadonlyNonEmptyArray } from 'fp-ts/ReadonlyNonEmptyArray';
import { BetterOneTabExportedTabList } from './BetterOneTabExportedTabList';
import { TabListEntityToCreate } from '../../TabList/TabListEntityToCreate';
import { TabListEntity } from '../../TabList/TabListEntity';
import { TabEntityToCreate } from '../../TabList/TabEntityToCreate';
import { belongsToTabList, TabEntity } from '../../TabList/TabEntity';
import { BetterOneTabTabListExportSerializer } from './BetterOneTabTabListExportSerializer';
import { TabExportSerializer } from '../AppExportStrategy';
import { DatetimeService } from '../../../DataProcessing/Datetime';
import { checkNonEmpty } from '../../../Utils/fp-ts/ReadonlyArray';
import { ExportedTab } from '../AppExportStrategy/ExportedTab';

export class BetterOneTabTabListExportSerializerImpl implements BetterOneTabTabListExportSerializer {
  public constructor(
    private readonly tabExportSerializer: TabExportSerializer,
    private readonly datetimeService: DatetimeService,
  ) {}

  public serialize = (
    tabListEntities: ReadonlyArray<TabListEntity>,
    tabEntities: ReadonlyArray<TabEntity>,
  ): ReadonlyArray<BetterOneTabExportedTabList> =>
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
    serializedTabLists: ReadonlyArray<BetterOneTabExportedTabList>,
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

  private toSerializedTabList = ({ id, name, createdAt, ...tabListEntity }: TabListEntity) => (
    tabs: ReadonlyNonEmptyArray<ExportedTab>,
  ): BetterOneTabExportedTabList => ({
    ...tabListEntity,
    title: name,
    time: this.datetimeService.toTimeStamp(createdAt, true),
    tabs,
  });

  private fromSerializedTabList = ({
    title,
    time,
    tabs,
    ...serializedTabListEntity
  }: BetterOneTabExportedTabList): [
    TabListEntityToCreate,
    (tabListEntity: TabListEntity) => ReadonlyNonEmptyArray<TabEntityToCreate>,
  ] => [
    {
      ...serializedTabListEntity,
      name: title,
      createdAt: this.datetimeService.fromTimeStamp(time, true),
    },
    tabListEntity =>
      pipe(
        tabs,
        mapAN(this.tabExportSerializer.deserialize(tabListEntity)),
        //
      ),
  ];
}
