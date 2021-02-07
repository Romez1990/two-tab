import { Repository } from '../Storage';
import { TabEntity } from './TabEntity';
import { TabEntityToCreate } from './TabEntityToCreate';

export type TabRepository = Repository<TabEntity, TabEntityToCreate>;
