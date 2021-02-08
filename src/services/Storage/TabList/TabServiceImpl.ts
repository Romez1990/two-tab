import { pipe } from 'fp-ts/function';
import { ReadonlyNonEmptyArray, map as mapAN } from 'fp-ts/ReadonlyNonEmptyArray';
import { Task, map } from 'fp-ts/Task';
import { TabListEntity } from './TabListEntity';
import { TabToCreate } from './TabToCreate';
import { Tab, fromTabEntity, idLens } from './Tab';
import { TabService } from './TabService';
import { TabRepository } from './TabRepository';
import { TabEntityToCreate } from './TabEntityToCreate';
import { TabEntity } from './TabEntity';

export class TabServiceImpl implements TabService {
  public constructor(private readonly tabRepository: TabRepository) {}

  public getAll = (): Task<ReadonlyArray<TabEntity>> => this.tabRepository.getAll();

  public addAll = (
    tabListEntity: TabListEntity,
    tabs: ReadonlyNonEmptyArray<TabToCreate>,
  ): Task<ReadonlyNonEmptyArray<Tab>> =>
    pipe(
      tabs,
      mapAN(this.toTabEntityToCreate(tabListEntity)),
      this.tabRepository.saveAll.bind(this.tabRepository),
      map(mapAN(fromTabEntity)),
    );

  private toTabEntityToCreate = ({ id }: TabListEntity) => (tab: TabToCreate): TabEntityToCreate => ({
    ...tab,
    tabListId: id,
  });

  public delete = ({ id }: Tab): Task<void> => this.tabRepository.deleteAllById([id]);

  public deleteAll = (tabs: ReadonlyNonEmptyArray<Tab>): Task<void> =>
    pipe(
      tabs,
      mapAN(idLens.get),
      this.tabRepository.deleteAllById.bind(this.tabRepository),
      //
    );
}
