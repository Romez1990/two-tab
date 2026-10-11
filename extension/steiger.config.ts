import fsd from '@feature-sliced/steiger-plugin';
import { defineConfig } from 'steiger';

export default defineConfig([
  ...fsd.configs.recommended,
  {
    // Точки входа WXT — не слой FSD: они только вызывают код из app.
    ignores: ['**/entrypoints/**'],
  },
]);
