import { ReadonlyNonEmptyArray } from 'fp-ts/ReadonlyNonEmptyArray';
import { Tab } from '../Tab';

export interface SerializedTabList {
  readonly id?: number;
  readonly name: string;
  readonly createdAtTimestamp: number;
  readonly tabs: ReadonlyNonEmptyArray<Tab>;
}
