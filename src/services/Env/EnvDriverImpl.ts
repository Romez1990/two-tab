import { EnvDriver } from './EnvDriver';

type ProcessEnv = NodeJS.ProcessEnv;

export class EnvDriverImpl implements EnvDriver {
  public constructor(private readonly env: ProcessEnv) {}

  public getString(varName: string): string | undefined {
    return this.env[varName];
  }
}
