import { pipe } from 'fp-ts/function';
import { filter, map as mapA } from 'fp-ts/ReadonlyArray';
import { map as mapAN } from 'fp-ts/ReadonlyNonEmptyArray';
import { checkNonEmpty } from '../../Utils/fp-ts/ReadonlyArray';
import { StoredTabList, toTabList } from './StoredTabList';
import { StoredTab, toTab } from './StoredTab';
import { TabList } from './TabList';
import { TabListNormalizer } from './TabListNormalizer';

export class TabListNormalizerImpl implements TabListNormalizer {
  public denormalize = (
    storedTabLists: ReadonlyArray<StoredTabList>,
    storedTabs: ReadonlyArray<StoredTab>,
  ): ReadonlyArray<TabList> =>
    pipe(
      storedTabLists,
      mapA(storedTabList =>
        pipe(
          storedTabs,
          filter(({ tabListId }) => tabListId === storedTabList.id),
          checkNonEmpty('tabs'),
          mapAN(toTab),
          toTabList(storedTabList),
        ),
      ),
    );
}