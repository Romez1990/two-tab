import fsd from '@feature-sliced/steiger-plugin';
import { defineConfig } from 'steiger';

export default defineConfig([
  ...fsd.configs.recommended,
  {
    // Точки входа WXT — не слой FSD: они только вызывают код из app.
    ignores: ['**/entrypoints/**'],
  },
  {
    // Пока слайсов мало, многие используются в одном месте (например, recreate-window — только во всплывающем окне,
    // на этапе 3 добавится страница «Окна»). Правило слияния включить, когда страниц станет больше.
    rules: { 'fsd/insignificant-slice': 'off' },
  },
]);
