import { pipe } from 'fp-ts/function';
import { Type } from 'io-ts';
import { TypeCheckingService } from '../TypeChecking';
import { JsonSerializer } from './JsonSerializer';

export class JsonSerializerImpl implements JsonSerializer {
  public constructor(private readonly json: JSON, private readonly typeChecking: TypeCheckingService) {}

  public serialize(data: unknown, pretty?: boolean): string {
    if (typeof data === 'undefined') return 'undefined';
    if (pretty) {
      return this.json.stringify(data, null, 2);
    }
    return this.json.stringify(data);
  }

  public deserialize = <A, O = A, I = unknown>(json: string, type: Type<A, O, I>): A =>
    pipe(
      this.json.parse(json),
      this.typeChecking.checkAndThrow(type),
      //
    );
}
