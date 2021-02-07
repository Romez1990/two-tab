import { TabEntityToCreate } from './TabEntityToCreate';
import { Tab } from './Tab';
import { TabListEntity } from './TabListEntity';

export interface TabEntity extends TabEntityToCreate {
  readonly id: number;
}

export const toTab = ({ tabListId, ...tab }: TabEntity): Tab => tab;

export const belongsToTabList = ({ id }: TabListEntity) => ({ tabListId }: TabEntity): boolean => tabListId === id;
