import { readonlyArray } from 'io-ts';
import { ExportedTabListT } from './index';

export const ExportedDataT = readonlyArray(ExportedTabListT);
