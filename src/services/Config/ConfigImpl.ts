import { EnvService } from '../Env';
import { Config } from './Config';
import { Environment, EnvironmentT } from './Types';

export class ConfigImpl implements Config {
  public constructor(private readonly env: EnvService) {
    this.environment = env.getOfType('NODE_ENV', EnvironmentT);
  }

  public readonly environment: Environment;
}
