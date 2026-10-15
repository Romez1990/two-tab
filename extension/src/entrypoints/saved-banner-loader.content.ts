import { mountSavedBanner } from '@/features/saved-banner';

// The "Already saved" banner. Not in the manifest: the background script injects it (features/saved-banner).
export default defineContentScript({
  registration: 'runtime',
  main() {
    mountSavedBanner();
  },
});
