import { boolean } from 'io-ts';
import { EnvService } from '../Env';
import { Config } from './Config';
import { EnvironmentT } from './Types';

export class ConfigImpl implements Config {
  public constructor(private readonly env: EnvService) {
    const environment = env.getOfType('NODE_ENV', EnvironmentT);
    this.isDevelopment = environment === 'development';
    this.isProduction = environment === 'production';
    this.isTesting = environment === 'test';
    this.isExtensionEnvironment = env.getOfType('EXTENSION_ENVIRONMENT', boolean);
  }

  public readonly isDevelopment: boolean;
  public readonly isProduction: boolean;
  public readonly isTesting: boolean;
  public readonly isExtensionEnvironment: boolean;
}
