import { DataExporter } from './DataExporter';

export interface DataExporterFactory {
  createAppDataExporter(): DataExporter<unknown>;
}
