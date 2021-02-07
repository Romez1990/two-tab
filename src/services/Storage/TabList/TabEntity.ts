import { TabEntityToCreate } from './TabEntityToCreate';
import { TabListEntity } from './TabListEntity';

export interface TabEntity extends TabEntityToCreate {
  readonly id: number;
}

export const belongsToTabList = ({ id }: TabListEntity) => ({ tabListId }: TabEntity): boolean => tabListId === id;
