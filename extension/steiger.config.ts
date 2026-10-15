import fsd from '@feature-sliced/steiger-plugin';
import { defineConfig } from 'steiger';

export default defineConfig([
  ...fsd.configs.recommended,
  {
    // WXT entry points are not an FSD layer: they only call code from app.
    ignores: ['**/entrypoints/**'],
  },
  {
    // While there are few slices, many are used in one place (for example recreate-window only on the "Windows" page). Enable the merge rule when there are more pages.
    rules: { 'fsd/insignificant-slice': 'off' },
  },
]);
