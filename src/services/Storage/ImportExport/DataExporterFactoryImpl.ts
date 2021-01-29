import { DataExporter } from './DataExporter';
import { DataExporterFactory } from './DataExporterFactory';
import { AppDataExporter, TabListExportSerializer } from './AppDataExporter';
import { BetterOneTabDataExporter } from './BetterOneTabDataExporter';
import { BetterOneTabTabListExportSerializer } from './BetterOneTabDataExporter/BetterOneTabTabListExportSerializer';

export class DataExporterFactoryImpl implements DataExporterFactory {
  public constructor(
    private readonly tabListExportSerializer: TabListExportSerializer,
    private readonly betterOneTabTabListExportSerializer: BetterOneTabTabListExportSerializer,
  ) {}

  public createAppDataExporter = (): DataExporter => new AppDataExporter(this.tabListExportSerializer) as DataExporter;

  public createBetterOneTabDataExporter = (): DataExporter =>
    new BetterOneTabDataExporter(this.betterOneTabTabListExportSerializer) as DataExporter;
}
