import { onExtensionInstalled } from '@/app/background';

export default defineBackground(() => {
  browser.runtime.onInstalled.addListener(onExtensionInstalled);
});
