// Обновляет договор локального сервиса (docs/extension/technologies.md, раздел 2.6): копирует
// api/openapi.yaml из Tidy Reel и заново строит из него типы. Путь к Tidy Reel — в
// extension/.env.local (не в git): TIDY_REEL_DIR=D:/.../tidy-reel. Прямые слэши: обратные
// в .env-файле Node читает как экранирование (\v — вертикальная табуляция).
import { execFileSync } from 'node:child_process';
import { copyFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ENV_FILE = '.env.local';
const CONTRACT = 'api/local-service.openapi.yaml';
const TYPES = 'src/shared/api/local-service/schema.d.ts';

if (existsSync(ENV_FILE)) process.loadEnvFile(ENV_FILE);
const dir = process.env.TIDY_REEL_DIR;
if (!dir) {
  console.error(`Задайте путь к Tidy Reel в extension/${ENV_FILE}:\nTIDY_REEL_DIR=D:/.../tidy-reel (образец — extension/.env.local.example)`);
  process.exit(1);
}
const source = join(dir, 'api', 'openapi.yaml');
if (!existsSync(source)) {
  console.error(`Нет файла ${source}: проверьте TIDY_REEL_DIR или выгрузите договор в Tidy Reel (export_openapi.py).`);
  process.exit(1);
}
copyFileSync(source, CONTRACT);
console.log(`Скопирован ${source} → ${CONTRACT}`);
// CLI запускается тем же Node напрямую: без оболочки, которая нужна Windows для pnpm.cmd.
execFileSync(process.execPath, ['node_modules/openapi-typescript/bin/cli.js', CONTRACT, '-o', TYPES], { stdio: 'inherit' });
