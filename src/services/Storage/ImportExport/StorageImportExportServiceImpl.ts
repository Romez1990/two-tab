import { pipe, constant } from 'fp-ts/function';
import { right, map as mapE } from 'fp-ts/Either';
import { Task, map, chain, task } from 'fp-ts/Task';
import { TaskEither, fromEither, chain as chainTE } from 'fp-ts/TaskEither';
import { sequenceT } from 'fp-ts/Apply';
import { TabListRepository, TabRepository, TabListSerializer } from '../TabList';
import { JsonSerializer } from '../../DataProcessing/Serializer';
import { TypeCheckingService, TypeCheckingError } from '../../DataProcessing/TypeChecking';
import { StorageImportExportService } from './StorageImportExportService';
import { DataT } from './Data';
import { TabListNormalizer } from '../TabList/TabListNormalizer';
import { Sort } from '../Storage';

export class StorageImportExportServiceImpl implements StorageImportExportService {
  public constructor(
    private readonly tabListRepository: TabListRepository,
    private readonly tabRepository: TabRepository,
    private readonly tabListSerializer: TabListSerializer,
    private readonly tabListNormalizer: TabListNormalizer,
    private readonly jsonSerializer: JsonSerializer,
    private readonly typeChecking: TypeCheckingService,
  ) {}

  public export = (): Task<string> =>
    pipe(
      sequenceT(task)(this.tabListRepository.getAll(Sort.by('createdAt').descending()), this.tabRepository.getAll()),
      map(([storedTabLists, storedTabs]) => this.tabListSerializer.serialize(storedTabLists, storedTabs)),
      map(this.jsonSerializer.serialize.bind(this.jsonSerializer)),
    );

  public import = (json: string): TaskEither<TypeCheckingError, void> =>
    pipe(
      this.jsonSerializer.deserialize(json),
      this.typeChecking.check(DataT),
      mapE(this.tabListSerializer.deserialize.bind(this.tabListSerializer)),
      fromEither,
      chainTE(([tabLists, getTabs]) =>
        pipe(
          this.tabListRepository.saveAll(tabLists),
          map(getTabs),
          chain(this.tabRepository.saveAll.bind(this.tabRepository)),
          map(constant(right(undefined))),
        ),
      ),
    );
}
