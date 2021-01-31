import { ExportStrategy } from '../ExportStrategy';
import { BetterOneTabDataT, BetterOneTabData, BetterOneTabDataOutput } from './BetterOneTabData';
import { StoredTabListToCreate } from '../../TabList/StoredTabListToCreate';
import { StoredTabList } from '../../TabList/StoredTabList';
import { StoredTabToCreate } from '../../TabList/StoredTabToCreate';
import { StoredTab } from '../../TabList/StoredTab';
import { BetterOneTabTabListExportSerializer } from './BetterOneTabTabListExportSerializer';

export class BetterOneTabExportStrategy implements ExportStrategy<BetterOneTabData, BetterOneTabDataOutput> {
  public constructor(private readonly betterOneTabTabListExportSerializer: BetterOneTabTabListExportSerializer) {}

  public readonly exportedDataType = BetterOneTabDataT;

  public serialize = (
    storedTabLists: ReadonlyArray<StoredTabList>,
    storedTabs: ReadonlyArray<StoredTab>,
  ): BetterOneTabData => this.betterOneTabTabListExportSerializer.serialize(storedTabLists, storedTabs);

  public deserialize = (
    serializedTabLists: BetterOneTabData,
  ): [
    ReadonlyArray<StoredTabListToCreate>,
    (storedTabLists: ReadonlyArray<StoredTabList>) => ReadonlyArray<StoredTabToCreate>,
  ] => this.betterOneTabTabListExportSerializer.deserialize(serializedTabLists);
}
