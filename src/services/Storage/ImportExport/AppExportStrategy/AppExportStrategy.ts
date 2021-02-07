import { TabListEntity } from '../../TabList/TabListEntity';
import { TabEntity } from '../../TabList/TabEntity';
import { TabListEntityToCreate } from '../../TabList/TabListEntityToCreate';
import { TabEntityToCreate } from '../../TabList/TabEntityToCreate';
import { ExportStrategy } from '../ExportStrategy';
import { AppData, AppDataOutput, AppDataT } from './AppData';
import { TabListExportSerializer } from './TabListExportSerializer';

export class AppExportStrategy implements ExportStrategy<AppData, AppDataOutput> {
  public constructor(private readonly tabListExportSerializer: TabListExportSerializer) {}

  public readonly exportedDataType = AppDataT;

  public serialize = (tabListEntities: ReadonlyArray<TabListEntity>, tabEntities: ReadonlyArray<TabEntity>): AppData =>
    this.tabListExportSerializer.serialize(tabListEntities, tabEntities);

  public deserialize = (
    serializedTabLists: AppData,
  ): [
    ReadonlyArray<TabListEntityToCreate>,
    (tabListEntities: ReadonlyArray<TabListEntity>) => ReadonlyArray<TabEntityToCreate>,
  ] => this.tabListExportSerializer.deserialize(serializedTabLists);
}
