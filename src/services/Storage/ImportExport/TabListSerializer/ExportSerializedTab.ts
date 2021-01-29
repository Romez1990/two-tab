import { boolean, string, type, TypeOf, undefined, union } from 'io-ts';

export const ExportSerializedTabT = type({
  title: string,
  url: string,
  favIconUrl: union([string, undefined]),
  pinned: boolean,
});

export type ExportSerializedTab = TypeOf<typeof ExportSerializedTabT>;
