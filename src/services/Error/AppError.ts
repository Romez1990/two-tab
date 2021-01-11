export abstract class AppError extends Error {
  protected constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }

  public throw(): never {
    // eslint-disable-next-line no-throw-literal
    throw this;
  }
}

export const throwError = (error: AppError): never => error.throw();