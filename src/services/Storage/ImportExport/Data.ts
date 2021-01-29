import { readonlyArray } from 'io-ts';
import { ExportSerializedTabListT } from './TabListSerializer';

export const DataT = readonlyArray(ExportSerializedTabListT);
