import { StoredTabToCreate } from './StoredTabToCreate';
import { Tab } from './Tab';
import { StoredTabList } from './StoredTabList';

export interface StoredTab extends StoredTabToCreate {
  readonly id: number;
}

export const toTab = ({ tabListId, ...tab }: StoredTab): Tab => tab;

export const belongsToTabList = ({ id }: StoredTabList) => ({ tabListId }: StoredTab): boolean => tabListId === id;
