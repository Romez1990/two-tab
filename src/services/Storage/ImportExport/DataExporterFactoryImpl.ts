import { DataExporter } from './DataExporter';
import { DataExporterFactory } from './DataExporterFactory';
import { AppDataExporter, TabListExportSerializer } from './AppDataExporter';

export class DataExporterFactoryImpl implements DataExporterFactory {
  public constructor(private readonly tabListExportSerializer: TabListExportSerializer) {}

  public createAppDataExporter = (): DataExporter<unknown> =>
    new AppDataExporter(this.tabListExportSerializer) as DataExporter<unknown>;
}
