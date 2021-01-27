import { Direction } from './Direction';

export class Sort {
  public constructor(public readonly fieldName: string, public readonly direction: Direction) {}

  public static by(fieldName: string): Sort {
    return new Sort(fieldName, Direction.Asc);
  }

  public ascending = (): Sort => new Sort(this.fieldName, Direction.Asc);

  public descending = (): Sort => new Sort(this.fieldName, Direction.Desc);
}
