import { Type } from 'io-ts';
import { EnvService } from './EnvService';
import { EnvDriver } from './EnvDriver';
import { EnvironmentVariableNotFoundError, BooleanEnvironmentVariableError } from './Errors';
import { TypeCheckingService } from '../TypeChecking';

export class EnvServiceImpl implements EnvService {
  public constructor(private readonly driver: EnvDriver, private readonly typeCheckingService: TypeCheckingService) {}

  public getString(varName: string): string {
    const value = this.driver.getString(varName);
    if (typeof value === 'undefined') throw new EnvironmentVariableNotFoundError(varName);
    return value;
  }

  public getBoolean(varName: string): boolean {
    const value = this.getString(varName);
    switch (value) {
      case 'true':
        return true;
      case 'false':
        return false;
      default:
        throw new BooleanEnvironmentVariableError(varName, value);
    }
  }

  public getOfType<T>(varName: string, type: Type<T>): T {
    const value = this.getString(varName);
    return this.typeCheckingService.checkAndThrow(type)(value);
  }
}
