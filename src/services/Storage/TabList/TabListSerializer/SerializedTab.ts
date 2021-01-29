import { type, boolean, number, string, undefined, union, TypeOf } from 'io-ts';

export const SerializedTabT = type({
  id: number,
  title: string,
  url: string,
  favIconUrl: union([string, undefined]),
  pinned: boolean,
});

export type SerializedTab = TypeOf<typeof SerializedTabT>;
