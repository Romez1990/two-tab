import { readonlyArray, TypeOf, OutputOf } from 'io-ts';
import { ExportedTabListT } from './ExportedTabList';

export const AppDataT = readonlyArray(ExportedTabListT);

export type AppData = TypeOf<typeof AppDataT>;
export type AppDataOutput = OutputOf<typeof AppDataT>;
