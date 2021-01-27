import { Repository } from '../Storage';
import { StoredTabList } from './StoredTabList';
import { StoredTabListToCreate } from './StoredTabListToCreate';

export type TabListRepository = Repository<StoredTabList, StoredTabListToCreate>;
