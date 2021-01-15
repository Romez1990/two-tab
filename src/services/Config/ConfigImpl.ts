import { EnvService } from '../Env';
import { Config } from './Config';
import { EnvironmentT } from './Types';

export class ConfigImpl implements Config {
  public constructor(private readonly env: EnvService) {
    const environment = env.getOfType('NODE_ENV', EnvironmentT);
    this.isDevelopment = environment === 'development';
    this.isProduction = environment === 'production';
    this.isTesting = environment === 'test';
  }

  public readonly isDevelopment: boolean;
  public readonly isProduction: boolean;
  public readonly isTesting: boolean;
}
