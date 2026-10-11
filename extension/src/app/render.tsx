import { StrictMode, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';

export function renderPage(page: ReactNode): void {
  const root = document.getElementById('root');
  if (!root) throw new Error('Нет элемента #root');
  createRoot(root).render(<StrictMode>{page}</StrictMode>);
}
