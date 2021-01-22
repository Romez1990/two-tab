import { EnvironmentError } from './EnvironmentError';

export class EnvironmentVariableNotFoundError extends EnvironmentError {
  public constructor(varName: string) {
    super(varName, `Environment variable "${varName}" not found`);
  }
}
