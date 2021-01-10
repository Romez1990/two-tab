export interface EnvDriver {
  getString(varName: string): string | undefined;
}
