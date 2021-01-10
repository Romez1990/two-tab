import { JsonSerializer } from './JsonSerializer';

export class JsonSerializerImpl implements JsonSerializer {
  public constructor(private readonly json: JSON) {}

  public serialize(data: unknown, pretty?: boolean): string {
    if (pretty) {
      return this.json.stringify(data, null, 2);
    }
    return this.json.stringify(data);
  }
}
