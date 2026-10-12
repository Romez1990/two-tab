import { mountSavedBanner } from '@/features/saved-banner';

// Плашка «Уже сохранено». Не в манифесте: её вставляет фоновый скрипт (features/saved-banner).
export default defineContentScript({
  registration: 'runtime',
  main() {
    mountSavedBanner();
  },
});
