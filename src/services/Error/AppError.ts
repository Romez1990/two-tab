export abstract class AppError extends Error {
  protected constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }

  public throw(): never {
    throw this;
  }
}

export const throwErr = (err: AppError): never => err.throw();
