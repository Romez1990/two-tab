import { number, string, type, TypeOf } from 'io-ts';
import { readonlyNonEmptyArray } from 'io-ts-types';
import { ExportedTabT } from '../AppDataExporter/ExportedTab';

export const BetterOneTabExportedTabListT = type({
  title: string,
  time: number,
  tabs: readonlyNonEmptyArray(ExportedTabT),
});

export type BetterOneTabExportedTabList = TypeOf<typeof BetterOneTabExportedTabListT>;
