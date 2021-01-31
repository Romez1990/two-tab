import { StoredTabList } from '../../TabList/StoredTabList';
import { StoredTab } from '../../TabList/StoredTab';
import { StoredTabListToCreate } from '../../TabList/StoredTabListToCreate';
import { StoredTabToCreate } from '../../TabList/StoredTabToCreate';
import { ExportStrategy } from '../ExportStrategy';
import { AppData, AppDataOutput, AppDataT } from './AppData';
import { TabListExportSerializer } from './TabListExportSerializer';

export class AppExportStrategy implements ExportStrategy<AppData, AppDataOutput> {
  public constructor(private readonly tabListExportSerializer: TabListExportSerializer) {}

  public readonly exportedDataType = AppDataT;

  public serialize = (
    storedTabLists: ReadonlyArray<StoredTabList>,
    storedTabs: ReadonlyArray<StoredTab>,
  ): AppData => this.tabListExportSerializer.serialize(storedTabLists, storedTabs);

  public deserialize = (
    serializedTabLists: AppData,
  ): [
    ReadonlyArray<StoredTabListToCreate>,
    (storedTabLists: ReadonlyArray<StoredTabList>) => ReadonlyArray<StoredTabToCreate>,
  ] => this.tabListExportSerializer.deserialize(serializedTabLists);
}
