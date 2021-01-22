import { readonlyArray } from 'io-ts';
import { SerializedTabListT } from '../TabList';

export const DataT = readonlyArray(SerializedTabListT);
