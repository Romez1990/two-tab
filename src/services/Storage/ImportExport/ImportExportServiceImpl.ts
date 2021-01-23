import { pipe, flow, constant } from 'fp-ts/function';
import { map as mapA } from 'fp-ts/ReadonlyArray';
import { right, left, map as mapE, fold } from 'fp-ts/Either';
import { Task, of, map } from 'fp-ts/Task';
import { TaskEither } from 'fp-ts/TaskEither';
import { TabListRepository, TabListSerializer } from '../TabList';
import { JsonSerializer } from '../../DataProcessing/Serializer';
import { TypeCheckingService, TypeCheckingError } from '../../DataProcessing/TypeChecking';
import { ImportExportService } from './ImportExportService';
import { DataT } from './Data';

export class ImportExportServiceImpl implements ImportExportService {
  public constructor(
    private readonly tabListRepository: TabListRepository,
    private readonly tabListSerializer: TabListSerializer,
    private readonly jsonSerializer: JsonSerializer,
    private readonly typeChecking: TypeCheckingService,
  ) {}

  public import = (json: string): TaskEither<TypeCheckingError, void> =>
    pipe(
      this.jsonSerializer.deserialize(json),
      this.typeChecking.check(DataT),
      mapE(mapA(this.tabListSerializer.deserialize.bind(this.tabListSerializer))),
      fold(
        //
        flow(left, of),
        tabLists =>
          pipe(
            this.tabListRepository.addTabLists(tabLists),
            map(constant(right(undefined))),
            //
          ),
      ),
    );

  public export = (): Task<string> =>
    pipe(
      this.tabListRepository.getAllTabLists(),
      map(mapA(this.tabListSerializer.serialize.bind(this.tabListSerializer))),
      map(this.jsonSerializer.serialize.bind(this.jsonSerializer)),
    );
}
