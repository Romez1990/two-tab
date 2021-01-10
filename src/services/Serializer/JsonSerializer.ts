export interface JsonSerializer {
  serialize(object: unknown, pretty?: boolean): string;
}
