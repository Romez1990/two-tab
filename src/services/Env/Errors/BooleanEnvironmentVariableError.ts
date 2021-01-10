import { EnvironmentError } from './EnvironmentError';

export class BooleanEnvironmentVariableError extends EnvironmentError {
  public constructor(varName: string, value: string) {
    super(varName, `Environment variable "${varName}" must be true or false but got ${value}`);
  }
}
