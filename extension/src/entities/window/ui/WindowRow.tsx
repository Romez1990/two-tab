import type { ReactNode } from 'react';
import type { BrowserWindow } from '../model/types';

export function WindowRow({ window, actions }: { window: BrowserWindow; actions?: ReactNode }) {
  const first = window.tabs[0];
  return (
    <li>
      <strong>{window.tabs.length} вкл.</strong> {first?.title || first?.url || '—'}
      {window.focused && ' (текущее)'} {actions}
    </li>
  );
}
