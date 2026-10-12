import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { StrictMode, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { theme } from '@/shared/ui';

export function renderPage(page: ReactNode): void {
  const root = document.getElementById('root');
  if (!root) throw new Error('Нет элемента #root');
  createRoot(root).render(
    <StrictMode>
      <ThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />
        {page}
      </ThemeProvider>
    </StrictMode>,
  );
}
