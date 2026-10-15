import { mountDownloadBanner } from '@/features/download-banner';

// The "Download" banner. Not in the manifest: the background script injects it (features/download-banner).
export default defineContentScript({
  registration: 'runtime',
  main() {
    mountDownloadBanner();
  },
});
