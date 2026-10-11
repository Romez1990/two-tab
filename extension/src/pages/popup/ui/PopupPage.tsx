import { useCallback, useEffect, useState } from 'react';
import { listWindows, WindowRow, type BrowserWindow } from '@/entities/window';
import { RecreateWindowButton } from '@/features/recreate-window';

/** Пока — список окон с кнопкой эксперимента «Пересоздать» (этап 1). */
export function PopupPage() {
  const [windows, setWindows] = useState<BrowserWindow[]>([]);
  const reload = useCallback(() => {
    void listWindows().then(setWindows);
  }, []);
  useEffect(reload, [reload]);

  return (
    <main style={{ minWidth: 360, padding: 8 }}>
      <h1>Окна</h1>
      <ol>
        {windows.map((w) => (
          <WindowRow key={w.id} window={w} actions={<RecreateWindowButton window={w} onDone={reload} />} />
        ))}
      </ol>
    </main>
  );
}
