import { mountDownloadBanner } from '@/features/download-banner';

// Плашка «Скачать». Не в манифесте: её вставляет фоновый скрипт (features/download-banner).
export default defineContentScript({
  registration: 'runtime',
  main() {
    mountDownloadBanner();
  },
});
