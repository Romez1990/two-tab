import { type, number, string, TypeOf } from 'io-ts';
import { readonlyNonEmptyArray } from 'io-ts-types';
import { ExportSerializedTabT } from './ExportSerializedTab';

export const ExportSerializedTabListT = type({
  name: string,
  createdAtTimestamp: number,
  tabs: readonlyNonEmptyArray(ExportSerializedTabT),
});

export type ExportSerializedTabList = TypeOf<typeof ExportSerializedTabListT>;
