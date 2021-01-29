import { OutputOf, readonlyArray, TypeOf } from 'io-ts';
import { BetterOneTabExportedTabListT } from './BetterOneTabExportedTabList';

export const BetterOneTabDataT = readonlyArray(BetterOneTabExportedTabListT);

export type BetterOneTabData = TypeOf<typeof BetterOneTabDataT>;
export type BetterOneTabDataOutput = OutputOf<typeof BetterOneTabDataT>;
