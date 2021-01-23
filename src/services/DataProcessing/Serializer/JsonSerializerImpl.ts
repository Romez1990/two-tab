import { JsonSerializer } from './JsonSerializer';

export class JsonSerializerImpl implements JsonSerializer {
  public constructor(private readonly json: JSON) {}

  public serialize(data: unknown, pretty?: boolean): string {
    if (typeof data === 'undefined') return 'undefined';
    const spaces = pretty ? 2 : undefined;
    return this.json.stringify(data, null, spaces);
  }

  public deserialize = (json: string): unknown => this.json.parse(json);
}
