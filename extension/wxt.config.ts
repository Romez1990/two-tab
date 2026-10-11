import { defineConfig } from 'wxt';

// Публичный ключ задаёт постоянный ID расширения при установке распакованным:
// hekmbnbeockkioccaegkknfdaagnmeni (docs/extension/technologies.md, «Установка без магазина»).
const MANIFEST_KEY =
  'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAq2hW3i9lkF1icA1/w72pnmqknbgPzPy9o1zkdCUSsaFPk7AvRtiB/Cbj02eBnt41hMU8fX78F5fa86d0j+eEH/Iu9n6qJJ7fYHrSnFzh5fmUp4LsWSf3NfyZ2LB2MCPleiQaKj5+fGf4lvna4oDM345nK1TMVblCaCjMxrsGTYZMFZ1gwIbp3qfpWxOihdKlcsASBl+nJQivJ4jn5B6pTzyBC0b7Nf3397lIYHXPj6NMGYrw7K9vu2uWiQo9PpMEG+kLXUXIc6njbd4CU/QjkuXPMyM9lI7ELTrJaDmeAQyIX/6o1Y+Xm17IiqTRcAFqFP/cCIpjm00BgN+bOLmCpwIDAQAB';

export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'Tabsurd',
    description: 'Сохраняет окна и группы вкладок, восстанавливает пропавшие и освобождает память.',
    key: MANIFEST_KEY,
    permissions: ['tabs', 'tabGroups', 'storage', 'unlimitedStorage', 'alarms', 'idle', 'notifications'],
  },
});
