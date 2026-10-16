import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const ENV_FILE = '.env.local';
const CONTRACT = 'api/local-service.openapi.yaml';

if (existsSync(ENV_FILE)) process.loadEnvFile(ENV_FILE);
const source = process.env.TIDY_REEL_DIR ? join(process.env.TIDY_REEL_DIR, 'api', 'openapi.yaml') : undefined;
const read = (path: string) => readFileSync(path, 'utf-8').replace(/\r\n/g, '\n');

// The extension contract is a copy of api/openapi.yaml from Tidy Reel. Without TIDY_REEL_DIR (extension/.env.local) Tidy Reel is not nearby and the check is skipped.
describe('local service contract', () => {
  it.skipIf(!source || !existsSync(source))('the extension copy matches the file in Tidy Reel', () => {
    expect(
      read(CONTRACT) === read(source as string),
      `${CONTRACT} отстаёт от Tidy Reel: выполните pnpm api:update (в папке extension)`,
    ).toBe(true);
  });
});
