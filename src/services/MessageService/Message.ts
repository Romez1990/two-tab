export abstract class Message<T> {
  protected constructor(data: T) {
    this._data = data;
  }

  private readonly _data: T;

  public get data(): T {
    return this._data;
  }
}
