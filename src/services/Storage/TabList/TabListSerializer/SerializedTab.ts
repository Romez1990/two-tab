import { type, boolean, number, string, undefined, union } from 'io-ts';

export const SerializedTabT = type({
  id: number,
  title: string,
  url: string,
  favIconUrl: union([string, undefined]),
  pinned: boolean,
});
