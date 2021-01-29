import { type, number, string, TypeOf } from 'io-ts';
import { readonlyNonEmptyArray } from 'io-ts-types';
import { ExportedTabT } from './ExportedTab';

export const ExportedTabListT = type({
  name: string,
  createdAtTimestamp: number,
  tabs: readonlyNonEmptyArray(ExportedTabT),
});

export type ExportedTabList = TypeOf<typeof ExportedTabListT>;
