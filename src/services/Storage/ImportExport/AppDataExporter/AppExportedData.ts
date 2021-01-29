import { readonlyArray, TypeOf, OutputOf } from 'io-ts';
import { ExportedTabListT } from './ExportedTabList';

export const AppExportedDataT = readonlyArray(ExportedTabListT);

export type ExportedData = TypeOf<typeof AppExportedDataT>;
export type ExportedDataOutput = OutputOf<typeof AppExportedDataT>;
