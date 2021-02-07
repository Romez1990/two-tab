import { pipe } from 'fp-ts/function';
import { filter, map as mapA } from 'fp-ts/ReadonlyArray';
import { map as mapAN } from 'fp-ts/ReadonlyNonEmptyArray';
import { checkNonEmpty } from '../../Utils/fp-ts/ReadonlyArray';
import { TabListEntity } from './TabListEntity';
import { TabList, fromTabListEntity } from './TabList';
import { TabEntity } from './TabEntity';
import { fromTabEntity } from './Tab';
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
          mapAN(fromTabEntity),
          fromTabListEntity(tabListEntity),
        ),
      ),
    );
}
