import { pipe } from 'fp-ts/function';
import { filter, map as mapA } from 'fp-ts/ReadonlyArray';
import { map as mapAN } from 'fp-ts/ReadonlyNonEmptyArray';
import { checkNonEmpty } from '../../Utils/fp-ts/ReadonlyArray';
import { TabListEntity, toTabList } from './TabListEntity';
import { TabEntity, toTab } from './TabEntity';
import { TabList } from './TabList';
import { TabListNormalizer } from './TabListNormalizer';

export class TabListNormalizerImpl implements TabListNormalizer {
  public denormalize = (
    tabListEntities: ReadonlyArray<TabListEntity>,
    tabEntities: ReadonlyArray<TabEntity>,
  ): ReadonlyArray<TabList> =>
    pipe(
      tabListEntities,
      mapA(tabListEntity =>
        pipe(
          tabEntities,
          filter(({ tabListId }) => tabListId === tabListEntity.id),
          checkNonEmpty('tabs'),
          mapAN(toTab),
          toTabList(tabListEntity),
        ),
      ),
    );
}
