import { pipe, constant } from 'fp-ts/function';
import { sequenceT } from 'fp-ts/Apply';
import { isNonEmpty } from 'fp-ts/ReadonlyArray';
import { right, map as mapE } from 'fp-ts/Either';
import { Task, map, chain, task } from 'fp-ts/Task';
import { TaskEither, right as rightTE, fromEither, chain as chainTE } from 'fp-ts/TaskEither';
import { TabListRepository, TabRepository } from '../TabList';
import { JsonSerializer } from '../../DataProcessing/Serializer';
import { TypeCheckingService, TypeCheckingError } from '../../DataProcessing/TypeChecking';
import { StorageImportExportService } from './StorageImportExportService';
import { Sort } from '../Storage';
import { checkNonEmpty } from '../../Utils/fp-ts/ReadonlyArray';
import { ExportStrategy } from './ExportStrategy';
import { ExportStrategyFactory } from './ExportStrategyFactory';
import { ExportStrategyName } from './exportStrategies';

export class StorageImportExportServiceImpl implements StorageImportExportService {
  public constructor(
    private readonly tabListRepository: TabListRepository,
    private readonly tabRepository: TabRepository,
    private readonly dataExporterFactory: ExportStrategyFactory,
    private readonly jsonSerializer: JsonSerializer,
    private readonly typeChecking: TypeCheckingService,
  ) {
    this.strategy = this.dataExporterFactory.create('app');
  }

  private strategy: ExportStrategy;

  public get strategyNames(): ReadonlyArray<ExportStrategyName> {
    return this.dataExporterFactory.strategyNames;
  }

  public setStrategy(strategyName: ExportStrategyName): void {
    this.strategy = this.dataExporterFactory.create(strategyName);
  }

  public export = (): Task<string> =>
    pipe(
      sequenceT(task)(this.tabListRepository.getAll(Sort.by('createdAt').descending()), this.tabRepository.getAll()),
      map(([storedTabLists, storedTabs]) => this.strategy.serialize(storedTabLists, storedTabs)),
      map(this.jsonSerializer.serialize.bind(this.jsonSerializer)),
    );

  public import = (json: string): TaskEither<TypeCheckingError, void> =>
    pipe(
      this.jsonSerializer.deserialize(json),
      this.typeChecking.check(this.strategy.exportedDataType),
      mapE(this.strategy.deserialize.bind(this.strategy)),
      fromEither,
      chainTE(([tabLists, getTabs]) =>
        isNonEmpty(tabLists)
          ? pipe(
              this.tabListRepository.saveAll(tabLists),
              map(getTabs),
              map(checkNonEmpty('stored tabs to create')),
              chain(this.tabRepository.saveAll.bind(this.tabRepository)),
              map(constant(right(undefined))),
            )
          : rightTE(undefined),
      ),
    );
}
