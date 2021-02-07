import { Repository } from '../Storage';
import { TabListEntity } from './TabListEntity';
import { TabListEntityToCreate } from './TabListEntityToCreate';

export type TabListRepository = Repository<TabListEntity, TabListEntityToCreate>;
