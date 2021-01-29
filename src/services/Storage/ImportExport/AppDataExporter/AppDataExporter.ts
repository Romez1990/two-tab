import { Type } from 'io-ts';
import { StoredTabList } from '../../TabList/StoredTabList';
import { StoredTab } from '../../TabList/StoredTab';
import { StoredTabListToCreate } from '../../TabList/StoredTabListToCreate';
import { StoredTabToCreate } from '../../TabList/StoredTabToCreate';
import { DataExporter } from '../DataExporter';
import { ExportedData, ExportedDataOutput, AppExportedDataT } from './AppExportedData';
import { TabListExportSerializer } from './TabListExportSerializer';

export class AppDataExporter implements DataExporter<ExportedData, ExportedDataOutput> {
  public constructor(private readonly tabListExportSerializer: TabListExportSerializer) {}

  public readonly exportedDataType: Type<ExportedData, ExportedDataOutput> = AppExportedDataT;

  public serialize = (
    storedTabLists: ReadonlyArray<StoredTabList>,
    storedTabs: ReadonlyArray<StoredTab>,
  ): ExportedData => this.tabListExportSerializer.serialize(storedTabLists, storedTabs);

  public deserialize = (
    serializedTabLists: ExportedData,
  ): [
    ReadonlyArray<StoredTabListToCreate>,
    (storedTabLists: ReadonlyArray<StoredTabList>) => ReadonlyArray<StoredTabToCreate>,
  ] => this.tabListExportSerializer.deserialize(serializedTabLists);
}
