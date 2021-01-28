import { pipe } from 'fp-ts/function';
import { map as mapA, filter, zipWith, unzip, flatten } from 'fp-ts/ReadonlyArray';
import { map as mapAN, ReadonlyNonEmptyArray } from 'fp-ts/ReadonlyNonEmptyArray';
import { SerializedTabList } from './SerializedTabList';
import { TabListSerializer } from './TabListSerializer';
import { DatetimeService } from '../../../DataProcessing/Datetime';
import { StoredTabList } from '../StoredTabList';
import { StoredTabListToCreate } from '../StoredTabListToCreate';
import { StoredTabToCreate } from '../StoredTabToCreate';
import { StoredTab, belongsToTabList } from '../StoredTab';
import { checkNonEmpty } from '../../../Utils/fp-ts/ReadonlyArray';
import { SerializedTab } from './SerializedTab';
import { TabSerializer } from './TabSerializer';

export class TabListSerializerImpl implements TabListSerializer {
  public constructor(
    private readonly tabSerializer: TabSerializer,
    private readonly datetimeService: DatetimeService,
  ) {}

  public serialize = (
    storedTabLists: ReadonlyArray<StoredTabList>,
    storedTabs: ReadonlyArray<StoredTab>,
  ): ReadonlyArray<SerializedTabList> =>
    pipe(
      storedTabLists,
      mapA(storedTabList =>
        pipe(
          storedTabs,
          filter(belongsToTabList(storedTabList)),
          checkNonEmpty('tabs'),
          mapAN(this.tabSerializer.serialize.bind(this.tabSerializer)),
          this.toSerializedTabList(storedTabList),
        ),
      ),
    );

  public deserialize = (
    serializedTabLists: ReadonlyArray<SerializedTabList>,
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
    tabs: ReadonlyNonEmptyArray<SerializedTab>,
  ): SerializedTabList => ({
    ...storedTabList,
    createdAtTimestamp: this.datetimeService.toTimeStamp(createdAt),
    tabs,
  });

  private fromSerializedTabList = ({
    createdAtTimestamp,
    tabs,
    ...serializedStoredTabList
  }: SerializedTabList): [
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
        mapAN(this.tabSerializer.deserialize(storedTabList)),
        //
      ),
  ];
}
