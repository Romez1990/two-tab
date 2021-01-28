import { type, number, string, TypeOf } from 'io-ts';
import { readonlyNonEmptyArray } from 'io-ts-types';
import { SerializedTabT } from './SerializedTab';

export const SerializedTabListT = type({
  name: string,
  createdAtTimestamp: number,
  tabs: readonlyNonEmptyArray(SerializedTabT),
});

export type SerializedTabList = TypeOf<typeof SerializedTabListT>;
