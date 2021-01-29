import { DataExporter } from './DataExporter';

export interface DataExporterFactory {
  createAppDataExporter(): DataExporter;
  createBetterOneTabDataExporter(): DataExporter;
}
