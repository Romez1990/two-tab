import { pipe } from 'fp-ts/function';
import { filter, flatten, map as mapA, unzip, zipWith } from 'fp-ts/ReadonlyArray';
import { map as mapAN, ReadonlyNonEmptyArray } from 'fp-ts/ReadonlyNonEmptyArray';
import { BetterOneTabExportedTabList } from './BetterOneTabExportedTabList';
import { StoredTabListToCreate } from '../../TabList/StoredTabListToCreate';
import { StoredTabList } from '../../TabList/StoredTabList';
import { StoredTabToCreate } from '../../TabList/StoredTabToCreate';
import { belongsToTabList, StoredTab } from '../../TabList/StoredTab';
import { BetterOneTabTabListExportSerializer } from './BetterOneTabTabListExportSerializer';
import { TabExportSerializer } from '../AppDataExporter';
import { DatetimeService } from '../../../DataProcessing/Datetime';
import { checkNonEmpty } from '../../../Utils/fp-ts/ReadonlyArray';
import { ExportedTab } from '../AppDataExporter/ExportedTab';

export class BetterOneTabTabListExportSerializerImpl implements BetterOneTabTabListExportSerializer {
  public constructor(
    private readonly tabExportSerializer: TabExportSerializer,
    private readonly datetimeService: DatetimeService,
  ) {}

  public serialize = (
    storedTabLists: ReadonlyArray<StoredTabList>,
    storedTabs: ReadonlyArray<StoredTab>,
  ): ReadonlyArray<BetterOneTabExportedTabList> =>
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
    serializedTabLists: ReadonlyArray<BetterOneTabExportedTabList>,
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

  private toSerializedTabList = ({ id, name, createdAt, ...storedTabList }: StoredTabList) => (
    tabs: ReadonlyNonEmptyArray<ExportedTab>,
  ): BetterOneTabExportedTabList => ({
    ...storedTabList,
    title: name,
    time: this.datetimeService.toTimeStamp(createdAt),
    tabs,
  });

  private fromSerializedTabList = ({
    title,
    time,
    tabs,
    ...serializedStoredTabList
  }: BetterOneTabExportedTabList): [
    StoredTabListToCreate,
    (storedTabList: StoredTabList) => ReadonlyNonEmptyArray<StoredTabToCreate>,
  ] => [
    {
      ...serializedStoredTabList,
      name: title,
      createdAt: this.datetimeService.fromTimeStamp(time),
    },
    storedTabList =>
      pipe(
        tabs,
        mapAN(this.tabExportSerializer.deserialize(storedTabList)),
        //
      ),
  ];
}
