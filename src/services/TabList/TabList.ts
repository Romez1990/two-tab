import { ReadonlyNonEmptyArray } from 'fp-ts/ReadonlyNonEmptyArray';
import { Lens } from 'monocle-ts';
import { Tab } from './Tab';

export interface TabList {
  readonly id?: number;
  readonly name: string;
  readonly date: Date;
  readonly tabs: ReadonlyNonEmptyArray<Tab>;
}

export const idLens = Lens.fromProp<TabList>()('id');
