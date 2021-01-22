import { constVoid, pipe } from 'fp-ts/function';
import { Task, map } from 'fp-ts/Task';
import { map as mapA } from 'fp-ts/ReadonlyArray';
import { TabListRepository, TabListSerializer } from '../TabList';
import { JsonSerializer } from '../../DataProcessing/Serializer';
import { ImportExportService } from './ImportExportService';
import { DataT } from './Data';

export class ImportExportServiceImpl implements ImportExportService {
  public constructor(
    private readonly tabListRepository: TabListRepository,
    private readonly tabListSerializer: TabListSerializer,
    private readonly jsonSerializer: JsonSerializer,
  ) {}

  public import = (json: string): Task<void> =>
    pipe(
      this.jsonSerializer.deserialize(json, DataT),
      mapA(this.tabListSerializer.deserialize.bind(this.tabListSerializer)),
      this.tabListRepository.addTabLists.bind(this.tabListRepository),
      map(constVoid),
    );

  public export = (): Task<string> =>
    pipe(
      this.tabListRepository.getAllTabLists(),
      map(mapA(this.tabListSerializer.serialize.bind(this.tabListSerializer))),
      map(this.jsonSerializer.serialize.bind(this.jsonSerializer)),
    );
}
