import { boolean } from 'io-ts';
import { EnvService } from '../Env';
import { Config } from './Config';
import { EnvironmentT } from './Types';
import { ConfigError } from './Errors';

export class ConfigImpl implements Config {
  public constructor(private readonly env: EnvService) {
    const environment = env.getOfType('NODE_ENV', EnvironmentT);
    this.isDevelopment = environment === 'development';
    this.isProduction = environment === 'production';
    this.isTesting = environment === 'test';

    this.isExtensionEnvironment = env.getOfType('EXTENSION_ENVIRONMENT', boolean);

    this.backendUrl = env.getString('BACKEND_URL');
    if (this.backendUrl.endsWith('/')) {
      throw new ConfigError('BACKEND_URL must not end with /');
    }
  }

  public readonly isDevelopment: boolean;
  public readonly isProduction: boolean;
  public readonly isTesting: boolean;
  public readonly isExtensionEnvironment: boolean;
  public readonly backendUrl: string;
}
