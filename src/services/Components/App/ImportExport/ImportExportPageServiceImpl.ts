import { pipe } from 'fp-ts/function';
import { right } from 'fp-ts/Either';
import { Task, map } from 'fp-ts/Task';
import { TaskEither, chainW } from 'fp-ts/TaskEither';
import { ImportExportPageService } from './ImportExportPageService';
import { StorageImportExportService, ExportStrategyName } from '../../../Storage/ImportExport';
import { FileReadingService } from '../../../DOM/FileReading';
import { DownloadService } from '../../../DOM/Download';
import { TypeCheckingError } from '../../../DataProcessing/TypeChecking';

export class ImportExportPageServiceImpl implements ImportExportPageService {
  public constructor(
    private readonly storageImportExport: StorageImportExportService,
    private readonly fileReading: FileReadingService,
    private readonly downloadService: DownloadService,
  ) {}

  public get strategyNames(): ReadonlyArray<ExportStrategyName> {
    return this.storageImportExport.strategyNames;
  }

  public setStrategy(strategyName: ExportStrategyName): void {
    this.storageImportExport.setStrategy(strategyName);
  }

  public import = (file: File): TaskEither<TypeCheckingError, void> =>
    pipe(
      this.fileReading.readAsText(file),
      map(right),
      chainW(this.storageImportExport.import.bind(this.storageImportExport)),
    );

  public export = (): Task<void> =>
    pipe(
      this.storageImportExport.export(),
      map(this.downloadService.download('Two Tab export.json')),
      //
    );
}
