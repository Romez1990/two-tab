import { TabListEntity } from './TabListEntity';
import { TabEntity } from './TabEntity';
import { TabList } from './TabList';

export interface TabListNormalizer {
  denormalize(
    tabListEntities: ReadonlyArray<TabListEntity>,
    tabEntities: ReadonlyArray<TabEntity>,
  ): ReadonlyArray<TabList>;
}
