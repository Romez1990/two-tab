import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'wxt';

// The public key sets a permanent extension ID when installed unpacked:
// hekmbnbeockkioccaegkknfdaagnmeni (docs/extension/technologies.md, "Installing without the store").
const MANIFEST_KEY =
  'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAq2hW3i9lkF1icA1/w72pnmqknbgPzPy9o1zkdCUSsaFPk7AvRtiB/Cbj02eBnt41hMU8fX78F5fa86d0j+eEH/Iu9n6qJJ7fYHrSnFzh5fmUp4LsWSf3NfyZ2LB2MCPleiQaKj5+fGf4lvna4oDM345nK1TMVblCaCjMxrsGTYZMFZ1gwIbp3qfpWxOihdKlcsASBl+nJQivJ4jn5B6pTzyBC0b7Nf3397lIYHXPj6NMGYrw7K9vu2uWiQo9PpMEG+kLXUXIc6njbd4CU/QjkuXPMyM9lI7ELTrJaDmeAQyIX/6o1Y+Xm17IiqTRcAFqFP/cCIpjm00BgN+bOLmCpwIDAQAB';

// chrome-launcher does not create the profile folder itself and fails if it is missing.
const CHROME_PROFILE = resolve('.chrome-profile');
mkdirSync(CHROME_PROFILE, { recursive: true });

export default defineConfig({
  srcDir: 'src',
  // npm run dev: our own permanent Chrome profile in extension/.chrome-profile, windows and extension data persist between runs.
  webExt: {
    chromiumProfile: CHROME_PROFILE,
    keepProfileChanges: true,
  },
  // Vite 8 listens on localhost only over IPv6 (::1) by default, while Chrome from the extension goes to 127.0.0.1
  dev: {
    server: { host: '127.0.0.1' },
  },
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'Tabsurd',
    description: 'Сохраняет окна и группы вкладок, восстанавливает пропавшие и освобождает память.',
    key: MANIFEST_KEY,
    permissions: [
      'tabs',
      'tabGroups',
      'storage',
      'unlimitedStorage',
      'alarms',
      'idle',
      'notifications',
      'favicon',
      'scripting',
      'offscreen',
    ],
    // Loading real titles of saved tabs; requested by a button on the "Saved" page.
    optional_host_permissions: ['<all_urls>'],
    // Site cookies of the video for downloading (docs/extension/pages/downloads.md); requested by the "Download" button.
    optional_permissions: ['cookies'],
    // The "Already saved" banner is an extension page in an iframe on sites.
    web_accessible_resources: [{ resources: ['saved-banner.html', 'download-banner.html'], matches: ['<all_urls>'] }],
  },
});
