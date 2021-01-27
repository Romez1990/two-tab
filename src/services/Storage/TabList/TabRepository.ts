import { Repository } from '../Storage';
import { StoredTab } from './StoredTab';
import { StoredTabToCreate } from './StoredTabToCreate';

export type TabRepository = Repository<StoredTab, StoredTabToCreate>;
