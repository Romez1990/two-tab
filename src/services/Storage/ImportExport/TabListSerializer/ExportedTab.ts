import { boolean, string, type, TypeOf, undefined, union } from 'io-ts';

export const ExportedTabT = type({
  title: string,
  url: string,
  favIconUrl: union([string, undefined]),
  pinned: boolean,
});

export type ExportedTab = TypeOf<typeof ExportedTabT>;
