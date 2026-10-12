import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'wxt';

// Публичный ключ задаёт постоянный ID расширения при установке распакованным:
// hekmbnbeockkioccaegkknfdaagnmeni (docs/extension/technologies.md, «Установка без магазина»).
const MANIFEST_KEY =
  'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAq2hW3i9lkF1icA1/w72pnmqknbgPzPy9o1zkdCUSsaFPk7AvRtiB/Cbj02eBnt41hMU8fX78F5fa86d0j+eEH/Iu9n6qJJ7fYHrSnFzh5fmUp4LsWSf3NfyZ2LB2MCPleiQaKj5+fGf4lvna4oDM345nK1TMVblCaCjMxrsGTYZMFZ1gwIbp3qfpWxOihdKlcsASBl+nJQivJ4jn5B6pTzyBC0b7Nf3397lIYHXPj6NMGYrw7K9vu2uWiQo9PpMEG+kLXUXIc6njbd4CU/QjkuXPMyM9lI7ELTrJaDmeAQyIX/6o1Y+Xm17IiqTRcAFqFP/cCIpjm00BgN+bOLmCpwIDAQAB';

// chrome-launcher не создаёт папку профиля сам и падает, если её нет.
const CHROME_PROFILE = resolve('.chrome-profile');
mkdirSync(CHROME_PROFILE, { recursive: true });

export default defineConfig({
  srcDir: 'src',
  // npm run dev: свой постоянный профиль Chrome в extension/.chrome-profile, окна и данные расширения сохраняются между запусками.
  webExt: {
    chromiumProfile: CHROME_PROFILE,
    keepProfileChanges: true,
  },
  // Vite 8 по умолчанию слушает localhost только на IPv6 (::1), а Chrome из расширения ходит на 127.0.0.1
  dev: {
    server: { host: '127.0.0.1' },
  },
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'Tabsurd',
    description: 'Сохраняет окна и группы вкладок, восстанавливает пропавшие и освобождает память.',
    key: MANIFEST_KEY,
    permissions: ['tabs', 'tabGroups', 'storage', 'unlimitedStorage', 'alarms', 'idle', 'notifications', 'favicon'],
  },
});
