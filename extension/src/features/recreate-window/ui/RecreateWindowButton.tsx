import { useState } from 'react';
import type { BrowserWindow } from '@/entities/window';
import { recreateWindow } from '../model/recreate-window';

export function RecreateWindowButton({ window, onDone }: { window: BrowserWindow; onDone: () => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setBusy(true);
    setError(null);
    try {
      await recreateWindow(window);
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button type="button" disabled={busy} onClick={handleClick}>
        Пересоздать
      </button>
      {error && <span role="alert"> {error}</span>}
    </>
  );
}
