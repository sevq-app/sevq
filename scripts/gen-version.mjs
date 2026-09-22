// Генерирует уникальную метку версии перед каждой сборкой — используется,
// чтобы открытая вкладка сама заметила выход нового деплоя (см.
// src/hooks/useAutoReloadOnNewVersion.ts) и обновилась, вместо того чтобы
// показывать пользователю кэшированную сломанную версию (баг с "белым
// экраном"/устаревшей сборкой после деплоя на GitHub Pages).
import { writeFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const version = String(Date.now());

mkdirSync(join(root, 'public'), { recursive: true });
writeFileSync(join(root, 'public', 'version.json'), JSON.stringify({ version }) + '\n');
writeFileSync(
  join(root, 'src', 'buildVersion.ts'),
  `// Генерируется автоматически перед сборкой (scripts/gen-version.mjs) — не редактировать руками.\nexport const APP_VERSION = '${version}';\n`
);

console.log('Сгенерирована версия сборки:', version);
