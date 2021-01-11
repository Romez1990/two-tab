import { Lens } from 'monocle-ts';
import { Tab } from './Tab';

export interface TabList {
  readonly id?: number;
  readonly name: string;
  readonly date: Date;
  readonly tabs: ReadonlyArray<Tab>;
}

export const idLens = Lens.fromProp<TabList>()('id');
