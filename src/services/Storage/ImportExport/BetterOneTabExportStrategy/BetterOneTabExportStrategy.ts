import { ExportStrategy } from '../ExportStrategy';
import { BetterOneTabDataT, BetterOneTabData, BetterOneTabDataOutput } from './BetterOneTabData';
import { TabListEntityToCreate } from '../../TabList/TabListEntityToCreate';
import { TabListEntity } from '../../TabList/TabListEntity';
import { TabEntityToCreate } from '../../TabList/TabEntityToCreate';
import { TabEntity } from '../../TabList/TabEntity';
import { BetterOneTabTabListExportSerializer } from './BetterOneTabTabListExportSerializer';

export class BetterOneTabExportStrategy implements ExportStrategy<BetterOneTabData, BetterOneTabDataOutput> {
  public constructor(private readonly betterOneTabTabListExportSerializer: BetterOneTabTabListExportSerializer) {}

  public readonly exportedDataType = BetterOneTabDataT;

  public serialize = (
    tabListEntities: ReadonlyArray<TabListEntity>,
    tabEntities: ReadonlyArray<TabEntity>,
  ): BetterOneTabData => this.betterOneTabTabListExportSerializer.serialize(tabListEntities, tabEntities);

  public deserialize = (
    serializedTabLists: BetterOneTabData,
  ): [
    ReadonlyArray<TabListEntityToCreate>,
    (tabListEntities: ReadonlyArray<TabListEntity>) => ReadonlyArray<TabEntityToCreate>,
  ] => this.betterOneTabTabListExportSerializer.deserialize(serializedTabLists);
}
