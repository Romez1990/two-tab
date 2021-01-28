import { boolean, string, type, TypeOf, undefined, union } from 'io-ts';

export const SerializedTabT = type({
  title: string,
  url: string,
  favIconUrl: union([string, undefined]),
  pinned: boolean,
});

export type SerializedTab = TypeOf<typeof SerializedTabT>;
