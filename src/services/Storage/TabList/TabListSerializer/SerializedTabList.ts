import { type, number, string, undefined, union, TypeOf } from 'io-ts';
import { readonlyNonEmptyArray } from 'io-ts-types';
import { TabT } from '../Tab';

export const SerializedTabListT = type({
  id: union([number, undefined]),
  name: string,
  createdAtTimestamp: number,
  tabs: readonlyNonEmptyArray(TabT),
});

export type SerializedTabList = TypeOf<typeof SerializedTabListT>;
