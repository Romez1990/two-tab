import { pipe } from 'fp-ts/function';
import { map as mapA, filter, zipWith, unzip, flatten } from 'fp-ts/ReadonlyArray';
import { map as mapAN, ReadonlyNonEmptyArray } from 'fp-ts/ReadonlyNonEmptyArray';
import { ExportSerializedTabList } from './ExportSerializedTabList';
import { TabListExportSerializer } from './TabListExportSerializer';
import { DatetimeService } from '../../../DataProcessing/Datetime';
import { checkNonEmpty } from '../../../Utils/fp-ts/ReadonlyArray';
import { ExportSerializedTab } from './ExportSerializedTab';
import { TabExportSerializer } from './TabExportSerializer';
import { StoredTabList } from '../../TabList/StoredTabList';
import { belongsToTabList, StoredTab } from '../../TabList/StoredTab';
import { StoredTabListToCreate } from '../../TabList/StoredTabListToCreate';
import { StoredTabToCreate } from '../../TabList/StoredTabToCreate';

export class TabListExportSerializerImpl implements TabListExportSerializer {
  public constructor(
    private readonly tabExportSerializer: TabExportSerializer,
    private readonly datetimeService: DatetimeService,
  ) {}

  public serialize = (
    storedTabLists: ReadonlyArray<StoredTabList>,
    storedTabs: ReadonlyArray<StoredTab>,
  ): ReadonlyArray<ExportSerializedTabList> =>
    pipe(
      storedTabLists,
      mapA(storedTabList =>
        pipe(
          storedTabs,
          filter(belongsToTabList(storedTabList)),
          checkNonEmpty('tabs'),
          mapAN(this.tabExportSerializer.serialize.bind(this.tabExportSerializer)),
          this.toSerializedTabList(storedTabList),
        ),
      ),
    );

  public deserialize = (
    serializedTabLists: ReadonlyArray<ExportSerializedTabList>,
  ): [
    ReadonlyArray<StoredTabListToCreate>,
    (storedTabLists: ReadonlyArray<StoredTabList>) => ReadonlyArray<StoredTabToCreate>,
  ] =>
    pipe(
      serializedTabLists,
      mapA(this.fromSerializedTabList.bind(this)),
      unzip,
      ([storedTabListsToCreate, getStoredTabToCreateFunctions]) => [
        storedTabListsToCreate,
        storedTabLists =>
          pipe(
            zipWith(storedTabLists, getStoredTabToCreateFunctions, (storedTabList, getStoredTabToCreate) =>
              getStoredTabToCreate(storedTabList),
            ),
            flatten,
          ),
      ],
    );

  private toSerializedTabList = ({ id, createdAt, ...storedTabList }: StoredTabList) => (
    tabs: ReadonlyNonEmptyArray<ExportSerializedTab>,
  ): ExportSerializedTabList => ({
    ...storedTabList,
    createdAtTimestamp: this.datetimeService.toTimeStamp(createdAt),
    tabs,
  });

  private fromSerializedTabList = ({
    createdAtTimestamp,
    tabs,
    ...serializedStoredTabList
  }: ExportSerializedTabList): [
    StoredTabListToCreate,
    (storedTabList: StoredTabList) => ReadonlyNonEmptyArray<StoredTabToCreate>,
  ] => [
    {
      ...serializedStoredTabList,
      createdAt: this.datetimeService.fromTimeStamp(createdAtTimestamp),
    },
    storedTabList =>
      pipe(
        tabs,
        mapAN(this.tabExportSerializer.deserialize(storedTabList)),
        //
      ),
  ];
}
