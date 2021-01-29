import { readonlyArray } from 'io-ts';
import { ExportedTabListT } from './TabListSerializer';

export const DataT = readonlyArray(ExportedTabListT);
