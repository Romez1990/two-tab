import { pipe, constant } from 'fp-ts/function';
import { right, map as mapE } from 'fp-ts/Either';
import { Task, map, chain, task } from 'fp-ts/Task';
import { TaskEither, right as rightTE, fromEither, chain as chainTE } from 'fp-ts/TaskEither';
import { sequenceT } from 'fp-ts/Apply';
import { isNonEmpty } from 'fp-ts/ReadonlyArray';
import { TabListRepository, TabRepository } from '../TabList';
import { JsonSerializer } from '../../DataProcessing/Serializer';
import { TypeCheckingService, TypeCheckingError } from '../../DataProcessing/TypeChecking';
import { StorageImportExportService } from './StorageImportExportService';
import { ExportedDataT } from './TabListSerializer/Data';
import { Sort } from '../Storage';
import { checkNonEmpty } from '../../Utils/fp-ts/ReadonlyArray';
import { TabListExportSerializer } from './TabListSerializer';

export class StorageImportExportServiceImpl implements StorageImportExportService {
  public constructor(
    private readonly tabListRepository: TabListRepository,
    private readonly tabRepository: TabRepository,
    private readonly tabListExportSerializer: TabListExportSerializer,
    private readonly jsonSerializer: JsonSerializer,
    private readonly typeChecking: TypeCheckingService,
  ) {}

  public export = (): Task<string> =>
    pipe(
      sequenceT(task)(this.tabListRepository.getAll(Sort.by('createdAt').descending()), this.tabRepository.getAll()),
      map(([storedTabLists, storedTabs]) => this.tabListExportSerializer.serialize(storedTabLists, storedTabs)),
      map(this.jsonSerializer.serialize.bind(this.jsonSerializer)),
    );

  public import = (json: string): TaskEither<TypeCheckingError, void> =>
    pipe(
      this.jsonSerializer.deserialize(json),
      this.typeChecking.check(ExportedDataT),
      mapE(this.tabListExportSerializer.deserialize.bind(this.tabListExportSerializer)),
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
